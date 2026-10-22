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
    <form onSubmit={handleJoin} className="w-full bg-white rounded-2xl p-2 flex items-center shadow-2xl shadow-black/20">
      <div className="pl-4 pr-2 text-slate-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
      </div>
      <input
        type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Masukkan 6 digit kode kelas..." required maxLength={6}
        className="flex-1 bg-transparent text-slate-800 px-2 py-3 uppercase font-mono font-bold tracking-widest focus:outline-none placeholder:font-sans placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400 text-sm"
      />
      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-slate-300 whitespace-nowrap active:scale-95 text-sm shadow-md">
        {loading ? '...' : 'Gabung'}
      </button>
    </form>
  )
}