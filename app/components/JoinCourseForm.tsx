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

    // Panggil RPC yang kita buat di database
    const { error } = await supabase.rpc('enroll_by_code', {
      p_code: code,
      p_student_id: userId
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Berhasil bergabung ke kelas!')
      setCode('')
      router.refresh() // Refresh halaman agar kelas baru muncul
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleJoin} className="bg-white p-6 rounded-lg shadow-sm border mb-8 flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <label className="block mb-2 font-medium text-gray-700">Punya Kode Kelas?</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Contoh: A1B2C3"
          className="w-full p-3 border rounded-lg uppercase font-mono tracking-widest"
          required
          maxLength={6}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 w-full md:w-auto"
      >
        {loading ? 'Memproses...' : 'Gabung Kelas'}
      </button>
    </form>
  )
}