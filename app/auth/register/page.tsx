'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      alert('Registrasi berhasil! Silakan periksa email Anda (jika verifikasi aktif) atau langsung login.')
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🧪</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">SciSphere</span>
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Buat Akun Baru</h2>
          <p className="text-slate-500 mt-2">Sudah punya akun? <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">Masuk di sini</Link></p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              placeholder="Nama Anda"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Daftar Sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 rounded-xl border font-medium text-sm transition flex items-center justify-center gap-2 ${role === 'student' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                🎓 Siswa
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-3 rounded-xl border font-medium text-sm transition flex items-center justify-center gap-2 ${role === 'teacher' ? 'bg-teal-50 border-teal-600 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                👨‍🏫 Guru
              </button>
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full mt-2 bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/30 disabled:bg-slate-400"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  )
}