import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()

  // 1. Cek user login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Ambil data kursus & pastikan ini kursus milik guru ini
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course || course.teacher_id !== user.id) {
    return notFound()
  }

  // 3. Ambil modul beserta pelajarannya
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      lessons (*)
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/dashboard/teacher" className="text-blue-600 hover:underline text-sm">
            &larr; Kembali ke Dasbor Guru
          </Link>
          <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
          <p className="text-gray-600 text-sm">{course.description}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Modul Pembelajaran</h2>
          <Link
            href={`/dashboard/teacher/courses/${courseId}/modules/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + Tambah Modul
          </Link>
        </div>

        {modules && modules.length > 0 ? (
          <div className="space-y-6">
            {modules.map((module: any) => (
              <div key={module.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{module.title}</h3>
                  </div>
                  <Link
                    href={`/dashboard/teacher/modules/${module.id}/lessons/new`}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    + Pelajaran
                  </Link>
                </div>

                {module.lessons && module.lessons.length > 0 ? (
                  <ul className="space-y-2">
                    {module.lessons.map((lesson: any) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <span className="font-medium">{lesson.title}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                          {lesson.content_type}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Belum ada pelajaran di modul ini.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500 mb-4">Belum ada modul di kursus ini.</p>
            <Link
              href={`/dashboard/teacher/courses/${courseId}/modules/new`}
              className="text-blue-600 hover:underline"
            >
              Buat modul pertama Anda &rarr;
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}