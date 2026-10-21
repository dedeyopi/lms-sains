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
    <form onSubmit={handleJoin} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex gap-2">
      <input
        type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Kode Kelas" required maxLength={6}
        className="flex-1 bg-white/90 text-slate-800 px-4 py-3 rounded-xl uppercase font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-white/50"
      />
      <button type="submit" disabled={loading}
        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:bg-slate-400 whitespace-nowrap">
        {loading ? '...' : 'Gabung'}
      </button>
    </form>
  )
}