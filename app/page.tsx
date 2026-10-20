import Link from 'next/link'
import { FlaskConical, BookOpen, BrainCircuit, Activity, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative">
      
      {/* Dekorasi Background Grid & Gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-teal-500 opacity-20 blur-[100px]"></div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">SciSphere</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-slate-600 hover:text-blue-600 font-medium transition">
            Masuk
          </Link>
          <Link href="/auth/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
            Daftar Sekarang
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col md:flex-row items-center gap-12">
        
        {/* Teks Kiri */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Platform Belajar Sains Masa Kini
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
            Jelajahi Dunia <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Sains Interaktif
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0">
            Belajar Fisika, Kimia, dan Biologi dengan simulasi interaktif, kuis otomatis, dan materi yang dirancang khusus untuk membuatmu jatuh cinta pada sains.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link href="/auth/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition shadow-xl">
              Mulai Belajar Gratis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto text-slate-600 font-medium hover:text-blue-600 transition py-4">
              Saya sudah punya akun
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center md:justify-start gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Simulasi PhET</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Kuis Otomatis</div>
          </div>
        </div>

        {/* Visual Kanan (Animasi Ilustrasi) */}
        <div className="flex-1 relative w-full max-w-lg mx-auto hidden md:block">
          <div className="relative w-full h-[500px]">
            {/* Lingkaran Latar */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-full blur-2xl animate-pulse"></div>
            
            {/* Kartu Mengambang 1 */}
            <div className="absolute top-10 left-10 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-float">
              <BrainCircuit className="w-12 h-12 text-blue-500 mb-3" />
              <h3 className="font-bold text-slate-800">Kuis Adaptif</h3>
              <p className="text-sm text-slate-500">Uji pemahamanmu</p>
            </div>

            {/* Kartu Mengambang 2 */}
            <div className="absolute bottom-10 right-10 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-float-delayed">
              <Activity className="w-12 h-12 text-teal-500 mb-3" />
              <h3 className="font-bold text-slate-800">Progres Real-time</h3>
              <p className="text-sm text-slate-500">Pantau hasil belajarmu</p>
            </div>

            {/* Ikon Tengah */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-full shadow-2xl border-4 border-blue-50">
              <FlaskConical className="w-20 h-20 text-blue-600" />
            </div>
          </div>
        </div>
      </main>

      {/* Fitur Section */}
      <section className="relative z-10 bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Kenapa Memilih SciSphere?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Kami menggabungkan teknologi modern dengan pedagogi sains untuk menciptakan pengalaman belajar yang tak terlupakan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Fitur 1 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Materi Multi-Format</h3>
              <p className="text-slate-600 leading-relaxed">Belajar tidak hanya lewat teks. Akses video, simulasi interaktif (PhET), presentasi Canva, hingga aplikasi web langsung dari dasbor.</p>
            </div>

            {/* Fitur 2 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Evaluasi Tanpa Ribet</h3>
              <p className="text-slate-600 leading-relaxed">Kerjakan kuis pilihan ganda dan dapatkan nilai secara instan. Guru dapat memantau hasil siswa secara otomatis.</p>
            </div>

            {/* Fitur 3 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Kelas Terstruktur</h3>
              <p className="text-slate-600 leading-relaxed">Guru dapat mengelola kelas dengan mudah, membagikan kode kelas, dan melacak progres belajar setiap murid secara detail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 text-slate-400 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-blue-500" />
          <span className="text-white font-bold text-lg">SciSphere</span>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} SciSphere LMS. Dibuat untuk masa depan pendidikan sains Indonesia.</p>
      </footer>
    </div>
  )
}