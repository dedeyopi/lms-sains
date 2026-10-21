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

  // Ambil profil, tapi jangan crash jika tidak ada (.maybeSingle bukan .single)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  // Fallback: Jika profil kosong, ambil nama dari metadata auth (saat register)
  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Siswa'
  const userRole = profile?.role || user.user_metadata?.role || 'student' // Default ke student

  // Ambil kursus yang diikuti
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      courses (
        id, title, description, subject
      )
    `)
    .eq('student_id', user.id)

  const myCourses = enrollments?.map((e: any) => e.courses).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar Modern */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🧪</span>
            <span className="text-xl font-bold text-slate-800 tracking-tight">SciSphere</span>
          </Link>
          <div className="flex items-center gap-4">
            {userRole === 'teacher' && (
              <Link href="/dashboard/teacher" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-100 transition">
                Mode Guru
              </Link>
            )}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{displayName}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header & Form Join */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl p-8 md:p-12 mb-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Halo, {displayName.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 text-lg">Siap untuk menjelajahi hal baru hari ini? Masukkan kode kelas dari gurumu untuk memulai.</p>
          </div>
          
          {/* Form Join SELALU ditampilkan jika bukan Guru (atau jika role tidak diketahui) */}
          <div className="relative z-10 w-full md:w-96">
            {userRole !== 'teacher' && <JoinCourseForm userId={user.id} />}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          📚 Kelas yang Diikuti
        </h2>
        
        {myCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course: any) => (
              <Link key={course.id} href={`/dashboard/courses/${course.id}`}
                className="group block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
                    {course.subject}
                  </span>
                  <span className="text-slate-300 group-hover:text-blue-500 transition">&rarr;</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition">{course.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{course.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
            <div className="text-5xl mb-4">🏫</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Kelas</h3>
            <p className="text-slate-500">Anda belum bergabung dengan kelas mana pun. Mintalah kode kelas kepada guru Anda.</p>
          </div>
        )}
      </main>
    </div>
  )
}