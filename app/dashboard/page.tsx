import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinCourseForm from '@/app/components/JoinCourseForm'

export const dynamic = 'force-dynamic'

// Helper untuk visual kartu kelas
const getSubjectStyle = (subject: string) => {
  switch (subject.toLowerCase()) {
    case 'physics': return { gradient: 'from-blue-500 to-cyan-400', icon: '⚛️', badgeBg: 'bg-blue-50 text-blue-700 border-blue-100' }
    case 'chemistry': return { gradient: 'from-purple-500 to-fuchsia-400', icon: '🧪', badgeBg: 'bg-purple-50 text-purple-700 border-purple-100' }
    case 'biology': return { gradient: 'from-emerald-500 to-teal-400', icon: '🌿', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
    default: return { gradient: 'from-slate-700 to-slate-500', icon: '🔬', badgeBg: 'bg-slate-50 text-slate-700 border-slate-200' }
  }
}

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
      {/* Navbar Kaca */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-sm">
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
        {/* Hero Section (Grid Presisi) */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 mb-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] bg-slate-900 text-white grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Ornamen Latar */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500 opacity-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">{displayName.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              Siap untuk eksplorasi sains hari ini? Masukkan kode kelas dari gurumu untuk membuka materi baru.
            </p>
          </div>
          
          {/* Form di Kanan (Hanya Siswa) */}
          <div className="relative z-10 flex lg:justify-end">
            {userRole !== 'teacher' && (
              <div className="w-full max-w-md">
                <JoinCourseForm userId={user.id} />
              </div>
            )}
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
            {myCourses.map((course: any) => {
              const style = getSubjectStyle(course.subject)
              return (
                <Link key={course.id} href={`/dashboard/courses/${course.id}`}
                  className="group relative bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                  
                  {/* Banner Ilustrasi Kelas */}
                  <div className={`h-28 bg-gradient-to-br ${style.gradient} relative overflow-hidden p-6 flex items-center justify-between`}>
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                    <div className="text-5xl drop-shadow-md transform group-hover:scale-110 transition-transform duration-500">
                      {style.icon}
                    </div>
                  </div>
                  
                  {/* Konten Kartu */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-3">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border ${style.badgeBg}`}>
                        {course.subject}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors leading-tight line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6 flex-1">
                      {course.description}
                    </p>
                    
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition">Masuk Kelas</span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        &rarr;
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-[2rem] border border-slate-100 text-center shadow-sm flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6">🏫</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Kelas</h3>
            <p className="text-slate-500 max-w-sm mb-6">Anda belum bergabung dengan kelas mana pun. Mintalah kode kelas kepada guru Anda untuk memulai.</p>
          </div>
        )}
      </main>
    </div>
  )
}