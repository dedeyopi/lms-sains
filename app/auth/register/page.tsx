'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student') // <-- State baru
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // <-- Kirim role ke metadata
        }
      }
    })

    if (error) {
      alert('Gagal mendaftar: ' + error.message)
    } else {
      alert('Registrasi berhasil! Silakan login.')
      router.push('/auth/login')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Daftar Akun LMS Sains</h1>
      
      <input
        type="text" placeholder="Nama Lengkap" value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full p-2 border rounded mb-3" required
      />
      <input
        type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-3" required
      />
      <input
        type="password" placeholder="Password (min. 6 karakter)" value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-3" required minLength={6}
      />
      
      {/* Pilihan Role */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
        className="w-full p-2 border rounded mb-3"
      >
        <option value="student">Siswa</option>
        <option value="teacher">Guru</option>
      </select>
      
      <button 
        type="submit" disabled={loading}
        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'Memproses...' : 'Daftar'}
      </button>

      <p className="mt-4 text-sm text-center">
        Sudah punya akun? <Link href="/auth/login" className="text-blue-600 hover:underline">Login di sini</Link>
      </p>
    </form>
  )
}