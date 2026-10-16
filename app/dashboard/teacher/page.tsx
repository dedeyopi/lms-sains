import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
  const supabase = await createClient()

  // 1. Cek user yang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Ambil profil untuk cek role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // 3. Jika bukan guru, tendang ke dashboard siswa
  if (profile?.role !== 'teacher') {
    redirect('/dashboard')
  }

  // 4. Ambil kursus yang dibuat oleh guru ini
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dasbor Guru</h1>
        <Link
          href="/dashboard/teacher/courses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Buat Kursus Baru
        </Link>
      </div>

      <p className="mb-4 text-gray-600">Halo, {profile?.full_name}! Berikut adalah kursus Anda:</p>

      {courses && courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course: any) => (
            <Link
              key={course.id}
              href={`/dashboard/courses/${course.id}`}
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-600">{course.description}</p>
              <span className="text-sm text-blue-600">{course.subject}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 border-2 border-dashed rounded">
          <p className="text-gray-500">Belum ada kursus. Mulai dengan membuat kursus pertama Anda!</p>
        </div>
      )}
    </div>
  )
}