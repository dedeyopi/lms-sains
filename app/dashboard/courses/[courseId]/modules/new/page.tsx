'use client'
import { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewModulePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = use(params)
  const [title, setTitle] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('modules').insert({
      course_id: courseId,
      title,
      order_index: orderIndex,
    })

    if (error) {
      alert('Gagal menambah modul: ' + error.message)
    } else {
      alert('Modul berhasil ditambahkan!')
      router.push(`/dashboard/teacher/courses/${courseId}`)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link
        href={`/dashboard/teacher/courses/${courseId}`}
        className="text-blue-600 hover:underline text-sm"
      >
        &larr; Kembali ke Kursus
      </Link>

      <h1 className="text-3xl font-bold mb-6 mt-2">Tambah Modul Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block mb-1 font-medium">Judul Modul</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="Contoh: Bab 1 - Hukum Newton"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Urutan Modul</label>
          <input
            type="number"
            value={orderIndex}
            onChange={(e) => setOrderIndex(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            required
            min={1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Angka lebih kecil akan ditampilkan lebih dulu.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Menyimpan...' : 'Simpan Modul'}
        </button>
      </form>
    </div>
  )
}