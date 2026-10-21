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
      setLoading(false)
    } else {
      router.push(`/dashboard/teacher/courses/${courseId}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/teacher/courses/${courseId}`} className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mb-6 transition">
          &larr; Kembali ke Manajemen Kelas
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📁</div>
            <h1 className="text-2xl font-bold text-slate-800">Tambah Modul Baru</h1>
            <p className="text-slate-500 mt-2">Buat bab atau topik baru untuk kelas ini.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Judul Modul</label>
              <input
                type="text" required
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
                placeholder="Contoh: Bab 1 - Pengenalan Ekosistem"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Urutan Modul</label>
              <input
                type="number" required min={1}
                value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
              />
              <p className="text-xs text-slate-500 mt-2">Angka lebih kecil akan ditampilkan lebih dulu.</p>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:bg-slate-400 mt-4"
            >
              {loading ? 'Menyimpan...' : 'Simpan Modul'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}