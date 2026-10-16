import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl mb-6">Kursus Sains</h1>
      <div className="grid gap-4">
        {courses?.map((course) => (
          <a
            key={course.id}
            href={`/dashboard/courses/${course.id}`}
            className="block p-4 border rounded hover:bg-gray-50"
          >
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <p className="text-gray-600">{course.description}</p>
            <span className="text-sm text-blue-600">{course.subject}</span>
          </a>
        ))}
      </div>
    </div>
  )
}