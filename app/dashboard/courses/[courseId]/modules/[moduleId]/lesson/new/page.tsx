'use client'
import { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewLessonPage({
  params,
}: {
  params: Promise<{ moduleId: string }>
}) {
  const { moduleId } = use(params)
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('text')
  const [content, setContent] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('lessons').insert({
      module_id: moduleId,
      title,
      content_type: contentType,
      content,
      order_index: orderIndex,
    })

    if (error) {
      alert('Gagal menambah pelajaran: ' + error.message)
    } else {
      alert('Pelajaran berhasil ditambahkan!')
      // Kembali ke halaman kursus (perlu course_id, kita bisa query dulu)
      router.back()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">
        &larr; Kembali
      </button>

      <h1 className="text-3xl font-bold mb-6 mt-2">Tambah Pelajaran Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block mb-1 font-medium">Judul Pelajaran</label>
          <input
            type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded" required
            placeholder="Contoh: Pengenalan Hukum Newton"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Tipe Konten</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="text">Teks Bacaan</option>
            <option value="video_link">Video YouTube</option>
            <option value="simulation_embed">Simulasi PhET</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            {contentType === 'text' && 'Isi Teks'}
            {contentType === 'video_link' && 'URL Video (YouTube)'}
            {contentType === 'simulation_embed' && 'URL Embed Simulasi PhET'}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded font-mono text-sm"
            rows={contentType === 'text' ? 8 : 3}
            required
            placeholder={
              contentType === 'text'
                ? 'Tuliskan materi pelajaran di sini...'
                : 'https://...'
            }
          />
          {contentType === 'simulation_embed' && (
            <p className="text-xs text-gray-500 mt-1">
              Contoh: https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Urutan Pelajaran</label>
          <input
            type="number" value={orderIndex}
            onChange={(e) => setOrderIndex(parseInt(e.target.value))}
            className="w-full p-2 border rounded" required min={1}
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Menyimpan...' : 'Simpan Pelajaran'}
        </button>
      </form>
    </div>
  )
}