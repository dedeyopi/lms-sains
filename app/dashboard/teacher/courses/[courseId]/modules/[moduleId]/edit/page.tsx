'use client'
import { useState, use, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>
}) {
  const { courseId, moduleId } = use(params)
  const [title, setTitle] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchModule = async () => {
      const { data } = await supabase.from('modules').select('*').eq('id', moduleId).single()
      if (data) {
        setTitle(data.title)
        setOrderIndex(data.order_index)
      }
      setLoading(false)
    }
    fetchModule()
  }, [moduleId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('modules')
      .update({ title, order_index: orderIndex })
      .eq('id', moduleId)

    if (error) {
      alert('Gagal mengedit modul: ' + error.message)
      setLoading(false)
    } else {
      alert('Modul berhasil diperbarui!')
      router.push(`/dashboard/teacher/courses/${courseId}`)
    }
  }

  if (loading) return <div className="p-10 text-center">Memuat data...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href={`/dashboard/teacher/courses/${courseId}`} className="text-blue-600 hover:underline text-sm">
        &larr; Kembali ke Kursus
      </Link>

      <h1 className="text-3xl font-bold mb-6 mt-2">Edit Modul</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block mb-1 font-medium">Judul Modul</label>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded" required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Urutan Modul</label>
          <input
            type="number" value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value))}
            className="w-full p-2 border rounded" required min={1}
          />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}