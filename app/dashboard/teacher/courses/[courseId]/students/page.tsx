import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StudentAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()

  // 1. Pastikan yang mengakses adalah guru pemilik kursus
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: course } = await supabase
    .from('courses')
    .select('title, teacher_id')
    .eq('id', courseId)
    .single()

  if (!course || course.teacher_id !== user.id) return notFound()

  // 2. Ambil semua pelajaran di kursus ini untuk menghitung total
  const { data: modules } = await supabase
    .from('modules')
    .select('id, lessons(id)')
    .eq('course_id', courseId)

  const allLessonIds = modules?.flatMap(m => m.lessons.map((l: any) => l.id)) || []
  const totalLessons = allLessonIds.length

  // 3. Ambil semua siswa (role = student)
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'student')

  // 4. Ambil semua progres siswa untuk kursus ini (Hanya jika ada pelajaran)
  let allProgress: any[] = []
  if (allLessonIds.length > 0) {
    const { data } = await supabase
      .from('student_progress')
      .select('student_id, lesson_id, completed')
      .in('lesson_id', allLessonIds)
      .eq('completed', true)
    if (data) allProgress = data
  }

  // 5. Ambil semua nilai kuis untuk kursus ini
  let quizResponses: any[] = []
  const { data: quizLessons } = await supabase
    .from('lessons')
    .select('id')
    .in('id', allLessonIds)
    .eq('content_type', 'quiz')
  
  const quizLessonIds = quizLessons?.map(l => l.id) || []

  if (quizLessonIds.length > 0) {
    const { data } = await supabase
      .from('quiz_responses')
      .select('student_id, is_correct, quiz_questions!inner(lesson_id, points)')
      .in('quiz_questions.lesson_id', quizLessonIds)
    if (data) quizResponses = data
  }

  // --- OLAH DATA UNTUK DITAMPILKAN ---
  const studentData = students?.map(student => {
    // Hitung pelajaran selesai
    const completedCount = allProgress.filter(p => p.student_id === student.id).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    // Hitung nilai kuis
    const studentResponses = quizResponses.filter(r => r.student_id === student.id)
    const totalScore = studentResponses.filter(r => r.is_correct).reduce((sum, r) => sum + (r.quiz_questions as any).points, 0)
    const maxScore = studentResponses.reduce((sum, r) => sum + (r.quiz_questions as any).points, 0)

    return {
      ...student,
      completedCount,
      progressPercentage,
      totalScore,
      maxScore,
      hasDoneQuiz: studentResponses.length > 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href={`/dashboard/teacher/courses/${courseId}`} className="text-blue-600 hover:underline text-sm">
            &larr; Kembali ke Kursus
          </Link>
          <h1 className="text-2xl font-bold mt-2">Analitik Siswa</h1>
          <p className="text-gray-600 text-sm">{course.title}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4 font-semibold text-gray-700">Nama Siswa</th>
                <th className="p-4 font-semibold text-gray-700 text-center">Progres Materi</th>
                <th className="p-4 font-semibold text-gray-700 text-center">Nilai Kuis</th>
              </tr>
            </thead>
            <tbody>
              {studentData && studentData.length > 0 ? (
                studentData.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{student.full_name}</td>
                    
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${student.progressPercentage}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{student.progressPercentage}%</span>
                      </div>
                      <span className="text-xs text-gray-400">({student.completedCount} dari {totalLessons} materi)</span>
                    </td>

                    <td className="p-4 text-center font-bold">
                      {student.hasDoneQuiz ? (
                        <span className="text-green-600">{student.totalScore} / {student.maxScore}</span>
                      ) : (
                        <span className="text-gray-400 text-sm font-normal">Belum Kuis</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Belum ada data siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}