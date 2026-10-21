import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Helper untuk ikon dan warna
const getContentBadge = (type: string) => {
  switch (type) {
    case 'text': return { icon: '📝', label: 'Teks', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'video_link': return { icon: '🎥', label: 'Video', color: 'bg-red-50 text-red-700 border-red-200' }
    case 'simulation_embed': return { icon: '🔬', label: 'Simulasi', color: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'web_embed': return { icon: '📱', label: 'Web/App', color: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'external_link': return { icon: '🔗', label: 'Link', color: 'bg-slate-50 text-slate-700 border-slate-200' }
    case 'quiz': return { icon: '❓', label: 'Kuis', color: 'bg-teal-50 text-teal-700 border-teal-200' }
    default: return { icon: '📄', label: type, color: 'bg-gray-50 text-gray-700 border-gray-200' }
  }
}

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Cek Enrollment
  const { data: enrollment } = await supabase.from('enrollments').select('id').eq('course_id', courseId).eq('student_id', user.id).single()

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Ditolak</h1>
          <p className="text-slate-500 mb-6">Anda belum terdaftar di kelas ini. Silakan kembali ke dasbor dan masukkan kode kelas yang benar.</p>
          <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Kembali ke Dasbor</Link>
        </div>
      </div>
    )
  }

  const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single()
  if (!course) return notFound()

  const { data: modules } = await supabase.from('modules').select(`*, lessons (*)`).eq('course_id', courseId).order('order_index', { ascending: true })
  const { data: progress } = await supabase.from('student_progress').select('lesson_id, completed').eq('student_id', user.id)

  const progressMap = new Map(progress?.map((p: any) => [p.lesson_id, p.completed]) || [])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mb-3 transition">
            &larr; Kembali ke Dasbor
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full uppercase tracking-wider">{course.subject}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{course.title}</h1>
          <p className="text-slate-500 mt-1">{course.description}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Materi Pembelajaran</h2>

        {modules && modules.length > 0 ? (
          <div className="space-y-8">
            {modules.map((module: any) => (
              <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800">{module.title}</h3>
                </div>

                <div className="p-4">
                  {module.lessons && module.lessons.length > 0 ? (
                    <ul className="space-y-3">
                      {module.lessons
                        .sort((a: any, b: any) => a.order_index - b.order_index)
                        .map((lesson: any) => {
                          const isCompleted = progressMap.get(lesson.id) === true
                          const badge = getContentBadge(lesson.content_type)
                          return (
                            <li key={lesson.id}>
                              <Link
                                href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition group gap-4"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Indikator Selesai */}
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent group-hover:border-blue-400'}`}>
                                    ✓
                                  </div>
                                  <div>
                                    <span className="block font-bold text-slate-800 group-hover:text-blue-700 transition text-lg">{lesson.title}</span>
                                    <div className="flex items-center gap-3 mt-1">
                                      {/* Ikon & Label Tipe Konten */}
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                                        <span>{badge.icon}</span> {badge.label}
                                      </span>
                                      {/* Estimasi Waktu */}
                                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                        ⏱️ {lesson.estimated_minutes || 10} Menit
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="hidden sm:flex text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                                  &rarr;
                                </div>
                              </Link>
                            </li>
                          )
                        })}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-sm italic text-center py-4">Belum ada pelajaran.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-500 font-medium">Guru belum menambahkan materi pada kursus ini.</p>
          </div>
        )}
      </main>
    </div>
  )
}