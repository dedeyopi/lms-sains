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
    .maybeSingle()

  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Siswa'
  const userRole = profile?.role || user.user_metadata?.role || 'student'

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`course_id, courses (id, title, description, subject)`)
    .eq('student_id', user.id)

  const myCourses = enrollments?.map((e: any) => e.courses).filter(Boolean) || []

  return (
    <div className="min-h-screen pb-20 animate-fade-in-up">
      {/* Navbar Kaca (Glassmorphism) */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:rotate-12 transition-transform">🧪</span>
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-600 tracking-tight">SciSphere</span>
          </Link>
          <div className="flex items-center gap-4">
            {userRole === 'teacher' && (
              <Link href="/dashboard/teacher" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition shadow-sm border border-blue-100">
                Mode Guru
              </Link>
            )}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-inner">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-slate-700 hidden sm:block">{displayName}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="text-sm font-bold text-slate-500 hover:text-red-600 transition">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 mb-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Ornamen Latar */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500 opacity-20 blur-3xl"></div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">{displayName.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
              Siap untuk eksplorasi sains hari ini? Masukkan kode kelas dari gurumu untuk membuka materi baru.
            </p>
          </div>
          
          <div className="relative z-10 w-full md:w-96">
            {userRole !== 'teacher' && <JoinCourseForm userId={user.id} />}
          </div>
        </div>

        {/* Daftar Kelas */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            📚 Kelas yang Diikuti
          </h2>
        </div>
        
        {myCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCourses.map((course: any) => (
              <Link key={course.id} href={`/dashboard/courses/${course.id}`}
                className="group relative bg-white p-7 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col">
                
                <div className="flex justify-between items-start mb-5">
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wider border border-blue-100">
                    {course.subject}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    &rarr;
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors leading-tight">{course.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed flex-1">{course.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-[2rem] border border-slate-100 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6">🏫</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Kelas</h3>
            <p className="text-slate-500 max-w-sm mb-6">Anda belum bergabung dengan kelas mana pun. Mintalah kode kelas kepada guru Anda untuk memulai.</p>
          </div>
        )}
      </main>
    </div>
  )
}