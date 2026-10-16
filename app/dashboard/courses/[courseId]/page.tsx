import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

// Tambahkan ini di atas file, setelah import
type Lesson = {
  id: string
  title: string
}

type Module = {
  id: string
  title: string
  lessons: Lesson[]
}

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const supabase = await createClient()

  // 1. Ambil data modul dan pelajaran berdasarkan courseId
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      lessons (*)
    `)
    .eq('course_id', params.courseId)
    .order('order_index', { ascending: true })

  if (!modules) {
    return notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daftar Modul</h1>
      
      {modules.map((module) => (
        <div key={module.id} className="mb-8 border p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">{module.title}</h2>
          
          <ul className="space-y-2">
            {module.lessons.map((lesson:Lesson) => (
              <li key={lesson.id}>
                <a 
                  href={`/dashboard/courses/${params.courseId}/lessons/${lesson.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {lesson.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}