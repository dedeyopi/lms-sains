import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinCourseForm from '@/app/components/JoinCourseForm'

export const dynamic = 'force-dynamic'

async function logout() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Ambil kursus yang HANYA diikuti oleh siswa ini
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      courses (
        id, title, description, subject
      )
    `)
    .eq('student_id', user.id)

  // Ekstrak data kursus dari hasil join
  const myCourses = enrollments?.map((e: any) => e.courses).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">LMS Sains</h1>
          <div className="flex items-center gap-4">
            {profile?.role === 'teacher' && (
              <Link href="/dashboard/teacher" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                Dasbor Guru
              </Link>
            )}
            <span className="text-gray-600 text-sm hidden md:block">
              Halo, {profile?.full_name || 'Pengguna'}
            </span>
            <form action={logout}>
              <button type="submit" className="text-red-600 hover:underline text-sm font-medium">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Tampilkan form gabung kelas HANYA jika dia siswa */}
        {profile?.role === 'student' && (
          <JoinCourseForm userId={user.id} />
        )}

        <h2 className="text-3xl font-bold mb-6 text-gray-800">Kelas Saya</h2>
        
        {myCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course: any) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="block bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition"
              >
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {course.subject}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-2">{course.title}</h3>
                <p className="text-gray-600 line-clamp-3">{course.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500 mb-4">Anda belum bergabung dengan kelas mana pun.</p>
            <p className="text-sm text-gray-400">Mintalah kode kelas kepada guru Anda, lalu masukkan di form di atas.</p>
          </div>
        )}
      </main>
    </div>
  )
}