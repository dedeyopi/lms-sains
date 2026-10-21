import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Gunakan maybeSingle() agar tidak crash jika profil belum ada
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  // Cek Role dari database ATAU dari metadata auth
  const userRole = profile?.role || user.user_metadata?.role
  const userName = profile?.full_name || user.user_metadata?.full_name || 'Guru'

  // Jika benar-benar bukan guru, tendang ke dasbor siswa
  if (userRole !== 'teacher') {
    redirect('/dashboard')
  }

  // Ambil data kursus
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  // Hitung statistik
  const totalClasses = courses?.length || 0
  let totalStudents = 0
  if (courses && courses.length > 0) {
    const courseIds = courses.map(c => c.id)
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
    totalStudents = count || 0
  }

  const getSubjectStyle = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'physics': return { gradient: 'from-blue-600 to-cyan-400', icon: '⚛️', textColor: 'text-blue-700', badgeBg: 'bg-blue-100 text-blue-800' }
      case 'chemistry': return { gradient: 'from-purple-600 to-fuchsia-400', icon: '🧪', textColor: 'text-purple-700', badgeBg: 'bg-purple-100 text-purple-800' }
      case 'biology': return { gradient: 'from-emerald-600 to-teal-400', icon: '🌿', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-100 text-emerald-800' }
      default: return { gradient: 'from-slate-700 to-slate-500', icon: '🔬', textColor: 'text-slate-700', badgeBg: 'bg-slate-100 text-slate-800' }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium text-sm">
            <span>&larr;</span> Ke Dasbor Siswa
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 shadow-sm">Mode Guru</span>
            <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Command Center 👨‍🏫</h1>
            <p className="text-slate-500">Selamat datang kembali, <span className="font-semibold text-slate-700">{userName}</span>. Kelola kelas dan pantau siswa Anda di sini.</p>
          </div>
          <Link href="/dashboard/teacher/courses/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center gap-2 transform hover:-translate-y-0.5">
            <span className="text-xl">+</span> Buat Kelas Baru
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🏫</div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Kelas</p>
              <p className="text-3xl font-black text-slate-800">{totalClasses}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">🎓</div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Siswa Terdaftar</p>
              <p className="text-3xl font-black text-slate-800">{totalStudents}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">📝</div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Status Sistem</p>
              <p className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span> Aktif
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Kelas yang Anda Ampu
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses?.map((course: any) => {
            const style = getSubjectStyle(course.subject)
            return (
              <Link key={course.id} href={`/dashboard/teacher/courses/${course.id}`}
                className="group relative bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-teal-400 transition-all duration-300 overflow-hidden flex flex-col">
                
                <div className={`h-32 bg-gradient-to-br ${style.gradient} relative overflow-hidden p-6 flex items-start justify-between`}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                  
                  <div className="text-6xl drop-shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 z-10">
                    {style.icon}
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-mono font-bold border border-white/20 z-10" title="Kode Kelas">
                    {course.enrollment_code}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${style.badgeBg}`}>
                      {course.subject}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-teal-700 transition leading-tight line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition">Masuk ke Kelas</span>
                    <div className="bg-slate-50 text-slate-500 p-2 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          <Link href="/dashboard/teacher/courses/new" 
            className="group border-2 border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer min-h-[350px]">
            <div className="w-20 h-20 bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 rounded-full flex items-center justify-center text-4xl mb-6 transition shadow-inner">
              +
            </div>
            <h3 className="text-xl font-bold text-slate-700 group-hover:text-blue-700 mb-2">Buat Kelas Baru</h3>
            <p className="text-sm text-slate-500 max-w-[200px]">Tambahkan mata pelajaran baru untuk siswa Anda.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}