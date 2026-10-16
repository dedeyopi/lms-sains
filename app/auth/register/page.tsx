'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Daftarkan user ke sistem autentikasi Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 2. Kirim nama lengkap sebagai metadata (data tambahan)
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      alert('Gagal mendaftar: ' + error.message)
    } else {
      alert('Registrasi berhasil! Silakan cek email Anda untuk verifikasi, atau langsung login.')
      router.push('/auth/login') // Arahkan ke halaman login setelah sukses
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Daftar Akun LMS Sains</h1>
      
      <input
        type="text" placeholder="Nama Lengkap" value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
      />
      <input
        type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
      />
      <input
        type="password" placeholder="Password (min. 6 karakter)" value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
        minLength={6}
      />
      
      <button 
        type="submit" 
        disabled={loading}
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