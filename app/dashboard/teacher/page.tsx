import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/dashboard')

  // Ambil data kursus
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  // Hitung statistik sederhana (Total Kelas & Total Kuis)
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

  // Fungsi untuk memberikan warna dan ikon berdasarkan mata pelajaran
  const getSubjectStyle = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'physics': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '⚛️', gradient: 'from-blue-500 to-cyan-400' }
      case 'chemistry': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🧪', gradient: 'from-purple-500 to-fuchsia-400' }
      case 'biology': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '🌿', gradient: 'from-emerald-500 to-teal-400' }
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '🔬', gradient: 'from-slate-600 to-slate-400' }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar Kaca (Glassmorphism) */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium text-sm">
            <span>&larr;</span> Ke Dasbor Siswa
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 shadow-sm">Mode Guru</span>
            <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header & Aksi */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Command Center 👨‍🏫</h1>
            <p className="text-slate-500">Selamat datang kembali, <span className="font-semibold text-slate-700">{profile?.full_name}</span>. Kelola kelas dan pantau siswa Anda di sini.</p>
          </div>
          <Link href="/dashboard/teacher/courses/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center gap-2 transform hover:-translate-y-0.5">
            <span className="text-xl">+</span> Buat Kelas Baru
          </Link>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

        {/* Daftar Kelas */}
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Kelas yang Anda Ampu
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course: any) => {
            const style = getSubjectStyle(course.subject)
            return (
              <Link key={course.id} href={`/dashboard/teacher/courses/${course.id}`}
                className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden">
                
                {/* Garis Atas Berwarna */}
                <div className={`h-2 w-full bg-gradient-to-r ${style.gradient}`}></div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border ${style.bg} ${style.text} ${style.border} flex items-center gap-1`}>
                      <span>{style.icon}</span> {course.subject}
                    </span>
                    <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-slate-200" title="Kode Kelas">
                      {course.enrollment_code}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition line-clamp-2">{course.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">{course.description}</p>
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-blue-600">
                    <span>Masuk ke Kelas</span>
                    <span className="bg-blue-50 p-1.5 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">&rarr;</span>
                  </div>
                </div>
              </Link>
            )
          })}

          {/* Kartu Kosong / Tambah Baru (Jika diinginkan) */}
          <Link href="/dashboard/teacher/courses/new" 
            className="group border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer min-h-[250px]">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 rounded-full flex items-center justify-center text-3xl mb-4 transition">
              +
            </div>
            <h3 className="font-bold text-slate-700 group-hover:text-blue-700">Buat Kelas Baru</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-[200px]">Tambahkan mata pelajaran baru untuk siswa Anda.</p>
          </Link>
        </div>
        
        {(!courses || courses.length === 0) && (
           <div className="text-center mt-10 text-slate-400 text-sm">
             *Anda belum memiliki kelas. Klik tombol di atas untuk memulai.
           </div>
        )}

      </main>
    </div>
  )
}