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

  const { data: courses } = await supabase.from('courses').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition">
            <span>&larr;</span> <span className="font-medium">Dasbor Siswa</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">Mode Guru</span>
            <span className="text-sm font-medium text-slate-700">{profile?.full_name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Manajemen Kelas 👨‍🏫</h1>
            <p className="text-slate-500">Kelola materi, kuis, dan pantau progres siswa Anda.</p>
          </div>
          <Link href="/dashboard/teacher/courses/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center gap-2">
            <span>+</span> Buat Kelas Baru
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course: any) => (
            <Link key={course.id} href={`/dashboard/teacher/courses/${course.id}`}
              className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  {course.subject}
                </span>
                <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono font-bold">
                  {course.enrollment_code}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition">{course.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-blue-600">
                <span>Kelola Kursus</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}

          {(!courses || courses.length === 0) && (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Kelas</h3>
              <p className="text-slate-500 mb-6">Anda belum membuat kelas. Mulai buat kelas pertama Anda sekarang!</p>
              <Link href="/dashboard/teacher/courses/new" className="text-blue-600 font-semibold hover:underline">
                Buat Kelas &rarr;
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}