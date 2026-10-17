'use client'
import { useState, use, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditLessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>
}) {
  const { moduleId, lessonId } = use(params)
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('text')
  const [content, setContent] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchLesson = async () => {
      const { data } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      if (data) {
        setTitle(data.title)
        setContentType(data.content_type)
        setContent(data.content)
        setOrderIndex(data.order_index)
      }
      setLoading(false)
    }
    fetchLesson()
  }, [lessonId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('lessons')
      .update({
        title,
        content_type: contentType,
        content,
        order_index: orderIndex,
      })
      .eq('id', lessonId)

    if (error) {
      alert('Gagal mengedit pelajaran: ' + error.message)
      setLoading(false)
    } else {
      alert('Pelajaran berhasil diperbarui!')
      router.back()
    }
  }

  if (loading) return <div className="p-10 text-center">Memuat data...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">
        &larr; Kembali
      </button>

      <h1 className="text-3xl font-bold mb-6 mt-2">Edit Pelajaran</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block mb-1 font-medium">Judul Pelajaran</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block mb-1 font-medium">Tipe Konten</label>
          <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full p-2 border rounded">
            <option value="text">📝 Teks Bacaan</option>
            <option value="video_link">🎥 Video YouTube</option>
            <option value="simulation_embed">🔬 Simulasi PhET</option>
            <option value="web_embed">📱 Aplikasi Web / Canva</option>
            <option value="external_link">🔗 Tautan Eksternal</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Konten / URL</label>
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded font-mono text-sm"
            rows={contentType === 'text' ? 10 : 3} required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Urutan Pelajaran</label>
          <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value))} className="w-full p-2 border rounded" required min={1} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}