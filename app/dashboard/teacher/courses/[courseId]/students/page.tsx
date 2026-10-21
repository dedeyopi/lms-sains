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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: course } = await supabase
    .from('courses')
    .select('title, teacher_id')
    .eq('id', courseId)
    .single()

  if (!course || course.teacher_id !== user.id) return notFound()

  const { data: modules } = await supabase
    .from('modules')
    .select('id, lessons(id)')
    .eq('course_id', courseId)

  const allLessonIds = modules?.flatMap(m => m.lessons.map((l: any) => l.id)) || []
  const totalLessons = allLessonIds.length

  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'student')

  let allProgress: any[] = []
  if (allLessonIds.length > 0) {
    const { data } = await supabase
      .from('student_progress')
      .select('student_id, lesson_id, completed')
      .in('lesson_id', allLessonIds)
      .eq('completed', true)
    if (data) allProgress = data
  }

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

  const studentData = students?.map(student => {
    const completedCount = allProgress.filter(p => p.student_id === student.id).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    const studentResponses = quizResponses.filter(r => r.student_id === student.id)
    const totalScore = studentResponses.filter(r => r.is_correct).reduce((sum, r) => sum + (r.quiz_questions as any).points, 0)
    const maxScore = studentResponses.reduce((sum, r) => sum + (r.quiz_questions as any).points, 0)
    const hasDoneQuiz = studentResponses.length > 0
    const quizPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

    return {
      ...student,
      completedCount,
      progressPercentage,
      totalScore,
      maxScore,
      hasDoneQuiz,
      quizPercentage
    }
  }).sort((a, b) => b.progressPercentage - a.progressPercentage) // Urutkan dari yang paling rajin

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href={`/dashboard/teacher/courses/${courseId}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2 mb-2 transition">
            &larr; Kembali ke Manajemen Kelas
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Analitik Siswa 📊</h1>
          <p className="text-slate-500 text-sm">{course.title}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-5 font-semibold">Nama Siswa</th>
                  <th className="p-5 font-semibold text-center w-1/3">Progres Materi</th>
                  <th className="p-5 font-semibold text-center">Nilai Kuis</th>
                </tr>
              </thead>
              <tbody>
                {studentData && studentData.length > 0 ? (
                  studentData.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">{student.full_name}</span>
                        </div>
                      </td>
                      
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-full max-w-[150px] bg-slate-200 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${student.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${student.progressPercentage}%` }}></div>
                          </div>
                          <div className="flex justify-between w-full max-w-[150px] text-xs font-medium text-slate-500">
                            <span>{student.progressPercentage}%</span>
                            <span>{student.completedCount}/{totalLessons} materi</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        {student.hasDoneQuiz ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border ${
                            student.quizPercentage >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            student.quizPercentage >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {student.totalScore} / {student.maxScore} 
                            <span className="text-xs font-normal opacity-70">({student.quizPercentage}%)</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Belum Kuis</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-12 text-center">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-slate-500 font-medium">Belum ada siswa yang bergabung di kelas ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}