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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/dashboard/teacher" className="text-blue-600 hover:underline text-sm">
            &larr; Kembali ke Dasbor Guru
          </Link>
          <div className="flex items-end justify-between mt-2">
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-gray-600 text-sm">{course.description}</p>
            </div>
            {/* KODE KELAS */}
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-center">
              <span className="text-xs text-blue-600 font-semibold block mb-1">Kode Kelas</span>
              <span className="text-2xl font-mono font-bold text-blue-800 tracking-wider">
                {course.enrollment_code}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Modul Pembelajaran</h2>
          <div className="flex gap-3">
            <Link 
              href={`/dashboard/teacher/courses/${courseId}/students`}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 text-sm font-medium transition"
            >
              📊 Lihat Progres Siswa
            </Link>
            <Link
              href={`/dashboard/teacher/courses/${courseId}/modules/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium transition"
            >
              + Tambah Modul
            </Link>
          </div>
        </div>

        {modules && modules.length > 0 ? (
          <div className="space-y-6">
            {modules.map((module: any) => (
              <div key={module.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                  <div>
                    <h3 className="text-xl font-bold">{module.title}</h3>
                    <span className="text-xs text-gray-500">Urutan: {module.order_index}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/dashboard/teacher/courses/${courseId}/modules/${module.id}/edit`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit Modul
                    </Link>
                    <form action={deleteModule}>
                      <input type="hidden" name="moduleId" value={module.id} />
                      <DeleteButton>Hapus Modul</DeleteButton>
                    </form>
                    <Link
                      href={`/dashboard/teacher/modules/${module.id}/lessons/new`}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 ml-2"
                    >
                      + Pelajaran
                    </Link>
                  </div>
                </div>

                {module.lessons && module.lessons.length > 0 ? (
                  <ul className="space-y-2">
                    {module.lessons.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => (
                      <li key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-3">
                           <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase min-w-[80px] text-center">
                            {lesson.content_type.replace('_', ' ')}
                          </span>
                          <span className="font-medium">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          
                          {lesson.content_type === 'quiz' && (
                            <Link
                              href={`/dashboard/teacher/modules/${module.id}/lessons/${lesson.id}/questions`}
                              className="text-emerald-600 hover:underline text-sm font-semibold"
                            >
                              Kelola Soal
                            </Link>
                          )}

                          <Link
                            href={`/dashboard/teacher/modules/${module.id}/lessons/${lesson.id}/edit`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Edit
                          </Link>
                          <form action={deleteLesson}>
                            <input type="hidden" name="lessonId" value={lesson.id} />
                            <DeleteButton>Hapus</DeleteButton>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">Belum ada pelajaran di modul ini.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500 mb-4">Belum ada modul di kursus ini.</p>
          </div>
        )}
      </main>
    </div>
  )
}