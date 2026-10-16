import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Server Action untuk logout
async function logout() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Cek user yang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Ambil profil user (nama dan role)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // 3. Ambil daftar kursus
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigasi */}
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

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Kursus Sains</h2>
        
        {courses && courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
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
            <p className="text-gray-500 mb-4">Belum ada kursus yang tersedia.</p>
            {profile?.role === 'teacher' && (
              <Link href="/dashboard/teacher/courses/new" className="text-blue-600 hover:underline">
                Buat kursus pertama Anda sekarang &rarr;
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}