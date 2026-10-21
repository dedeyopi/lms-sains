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
  const [estimatedMinutes, setEstimatedMinutes] = useState(10) // <-- State Baru
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
      estimated_minutes: estimatedMinutes, // <-- Simpan ke database
    })

    if (error) {
      alert('Gagal menambah pelajaran: ' + error.message)
      setLoading(false)
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mb-6 transition">
          &larr; Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📖</div>
            <h1 className="text-2xl font-bold text-slate-800">Tambah Pelajaran Baru</h1>
            <p className="text-slate-500 mt-2">Pilih format materi yang ingin Anda bagikan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Judul Pelajaran</label>
              <input
                type="text" required
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
                placeholder="Contoh: Rantai Makanan dan Jaring-jaring"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Konten</label>
                <select
                  value={contentType} onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
                >
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
                <input
                  type="number" required min={1}
                  value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {contentType === 'text' && 'Isi Teks Materi'}
                {contentType === 'video_link' && 'URL Video YouTube'}
                {contentType === 'simulation_embed' && 'URL Embed Simulasi PhET'}
                {contentType === 'web_embed' && 'URL Embed Aplikasi Web / Canva'}
                {contentType === 'external_link' && 'URL Tautan Eksternal'}
                {contentType === 'quiz' && 'Instruksi Kuis (Opsional)'}
              </label>
              <textarea
                value={content} onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-mono text-sm"
                rows={contentType === 'text' ? 10 : 3} required={contentType !== 'quiz'}
                placeholder={
                  contentType === 'text' ? 'Tuliskan materi lengkap di sini...' :
                  contentType === 'quiz' ? 'Contoh: Kerjakan soal berikut dengan teliti.' :
                  'https://...'
                }
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Urutan Pelajaran</label>
              <input
                type="number" required min={1}
                value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition shadow-lg shadow-teal-600/30 disabled:bg-slate-400 mt-4"
            >
              {loading ? 'Menyimpan...' : 'Simpan Pelajaran'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}