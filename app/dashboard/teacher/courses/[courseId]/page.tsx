import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import DeleteButton from '@/app/components/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function TeacherCourseDetailPage({
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
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course || course.teacher_id !== user.id) return notFound()

  const { data: modules } = await supabase
    .from('modules')
    .select(`*, lessons (*)`)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  async function deleteModule(formData: FormData) {
    'use server'
    const moduleId = formData.get('moduleId') as string
    const supabase = await createClient()
    await supabase.from('modules').delete().eq('id', moduleId)
    revalidatePath(`/dashboard/teacher/courses/${courseId}`)
  }

  async function deleteLesson(formData: FormData) {
    'use server'
    const lessonId = formData.get('lessonId') as string
    const supabase = await createClient()
    await supabase.from('lessons').delete().eq('id', lessonId)
    revalidatePath(`/dashboard/teacher/courses/${courseId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Kursus */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/dashboard/teacher" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2 mb-4 transition">
            &larr; Kembali ke Dasbor Guru
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wide mb-3 inline-block">
                {course.subject}
              </span>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{course.title}</h1>
              <p className="text-slate-500 max-w-2xl">{course.description}</p>
            </div>
            
            {/* Kode Kelas Box */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center min-w-[150px]">
              <span className="text-xs text-blue-600 font-bold block mb-1 uppercase tracking-wider">Kode Kelas</span>
              <span className="text-3xl font-mono font-black text-blue-800 tracking-widest">
                {course.enrollment_code}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Modul Pembelajaran</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link 
              href={`/dashboard/teacher/courses/${courseId}/students`}
              className="flex-1 sm:flex-none text-center bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold transition shadow-sm"
            >
              📊 Progres Siswa
            </Link>
            <Link
              href={`/dashboard/teacher/courses/${courseId}/modules/new`}
              className="flex-1 sm:flex-none text-center bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-semibold transition shadow-lg shadow-blue-600/30"
            >
              + Tambah Modul
            </Link>
          </div>
        </div>

        {modules && modules.length > 0 ? (
          <div className="space-y-6">
            {modules.map((module: any) => (
              <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header Modul */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{module.title}</h3>
                    <span className="text-xs font-medium text-slate-500">Urutan ke-{module.order_index}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/teacher/courses/${courseId}/modules/${module.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                    >
                      Edit
                    </Link>
                    <form action={deleteModule}>
                      <input type="hidden" name="moduleId" value={module.id} />
                      <DeleteButton className="text-red-500 hover:text-red-700 text-sm font-medium transition">Hapus</DeleteButton>
                    </form>
                    <Link
                      href={`/dashboard/teacher/modules/${module.id}/lessons/new`}
                      className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition shadow-sm ml-2"
                    >
                      + Pelajaran
                    </Link>
                  </div>
                </div>

                {/* Daftar Pelajaran */}
                <div className="p-4">
                  {module.lessons && module.lessons.length > 0 ? (
                    <ul className="space-y-2">
                      {module.lessons.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => (
                        <li key={lesson.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition group gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider min-w-[80px] text-center">
                              {lesson.content_type.replace('_', ' ')}
                            </span>
                            <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            {lesson.content_type === 'quiz' && (
                              <Link
                                href={`/dashboard/teacher/modules/${module.id}/lessons/${lesson.id}/questions`}
                                className="text-emerald-600 hover:text-emerald-800 text-sm font-bold"
                              >
                                Kelola Soal
                              </Link>
                            )}
                            <Link
                              href={`/dashboard/teacher/modules/${module.id}/lessons/${lesson.id}/edit`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </Link>
                            <form action={deleteLesson}>
                              <input type="hidden" name="lessonId" value={lesson.id} />
                              <DeleteButton className="text-red-500 hover:text-red-700 text-sm font-medium">Hapus</DeleteButton>
                            </form>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-sm italic text-center py-4">Belum ada pelajaran di modul ini.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-sm">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Kursus Masih Kosong</h3>
            <p className="text-slate-500 mb-6">Mulai susun materi dengan membuat modul pertama Anda.</p>
            <Link href={`/dashboard/teacher/courses/${courseId}/modules/new`} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              Buat Modul Pertama
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}