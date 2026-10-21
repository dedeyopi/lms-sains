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
  const [estimatedMinutes, setEstimatedMinutes] = useState(10)
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
        setEstimatedMinutes(data.estimated_minutes || 10)
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
      .update({ title, content_type: contentType, content, order_index: orderIndex, estimated_minutes: estimatedMinutes })
      .eq('id', lessonId)

    if (error) {
      alert('Gagal mengedit pelajaran: ' + error.message)
      setLoading(false)
    } else {
      router.back()
    }
  }

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Memuat data...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mb-6 transition">
          &larr; Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">✏️</div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Pelajaran</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Judul Pelajaran</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 transition font-medium" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Konten</label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 transition font-medium">
                  <option value="text">📝 Teks Bacaan</option>
                  <option value="video_link">🎥 Video YouTube</option>
                  <option value="simulation_embed">🔬 Simulasi PhET</option>
                  <option value="web_embed">📱 Aplikasi Web / Canva</option>
                  <option value="external_link">🔗 Tautan Eksternal</option>
                  <option value="quiz">❓ Kuis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Estimasi Waktu (Menit)</label>
                <input type="number" min={1} value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 transition font-medium" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Konten / URL</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 transition font-mono text-sm" rows={contentType === 'text' ? 10 : 3} required={contentType !== 'quiz'} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Urutan Pelajaran</label>
              <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 transition font-medium" required min={1} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:bg-slate-400 mt-4">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}