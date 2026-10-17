import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()

  // 1. Cek user login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. CEK ENROLLMENT (Apakah siswa terdaftar di kelas ini?)
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('student_id', user.id)
    .single()

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Anda belum terdaftar di kelas ini. Silakan kembali ke dasbor dan masukkan kode kelas yang benar.</p>
          <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Kembali ke Dasbor</Link>
        </div>
      </div>
    )
  }

  // 3. Ambil data kursus
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course) return notFound()

  // 4. Ambil modul beserta pelajaran
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      lessons (*)
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  // 5. Ambil progres siswa untuk kursus ini
  const { data: progress } = await supabase
    .from('student_progress')
    .select('lesson_id, completed')
    .eq('student_id', user.id)

  const progressMap = new Map(
    progress?.map((p: any) => [p.lesson_id, p.completed]) || []
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            &larr; Kembali ke Dasbor
          </Link>
          <span className="ml-3 text-xs font-semibold text-blue-600 uppercase tracking-wide">
            {course.subject}
          </span>
          <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
          <p className="text-gray-600 text-sm">{course.description}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Materi Pembelajaran</h2>

        {modules && modules.length > 0 ? (
          <div className="space-y-6">
            {modules.map((module: any) => (
              <div key={module.id} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-bold mb-4">{module.title}</h3>

                {module.lessons && module.lessons.length > 0 ? (
                  <ul className="space-y-2">
                    {module.lessons
                      .sort((a: any, b: any) => a.order_index - b.order_index)
                      .map((lesson: any) => {
                        const isCompleted = progressMap.get(lesson.id) === true
                        return (
                          <li key={lesson.id}>
                            <Link
                              href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                                    isCompleted
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {isCompleted && '✓'}
                                </span>
                                <span className="font-medium">{lesson.title}</span>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                                {lesson.content_type === 'text' && 'Teks'}
                                {lesson.content_type === 'video_link' && 'Video'}
                                {lesson.content_type === 'simulation_embed' && 'Simulasi'}
                                {lesson.content_type === 'web_embed' && 'Web'}
                                {lesson.content_type === 'external_link' && 'Link'}
                                {lesson.content_type === 'quiz' && 'Kuis'}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">Belum ada pelajaran.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500">Guru belum menambahkan materi pada kursus ini.</p>
          </div>
        )}
      </main>
    </div>
  )
}