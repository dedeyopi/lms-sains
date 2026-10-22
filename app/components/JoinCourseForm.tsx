'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function JoinCourseForm({ userId }: { userId: string }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.rpc('enroll_by_code', { p_code: code, p_student_id: userId })
    if (error) {
      alert(error.message)
    } else {
      alert('Berhasil bergabung ke kelas!')
      setCode('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleJoin} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col sm:flex-row gap-2 shadow-2xl">
      <input
        type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Kode Kelas (Cth: A1B2C3)" required maxLength={6}
        className="flex-1 bg-white text-slate-800 px-5 py-3.5 rounded-xl uppercase font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:font-sans placeholder:tracking-normal placeholder:font-medium text-sm"
      />
      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-500 transition disabled:bg-slate-400 whitespace-nowrap active:scale-95 text-sm shadow-lg shadow-blue-600/30">
        {loading ? 'Memproses...' : 'Gabung Kelas'}
      </button>
    </form>
  )
}