'use client'
import { useState, use, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/app/components/RichTextEditor' // <-- Import Editor

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
  
  // State untuk Gambar Sampul
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        setImageUrl(data.image_url || '')
      }
      setLoading(false)
    }
    fetchLesson()
  }, [lessonId, supabase])

  // Fungsi Upload Gambar Sampul
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('lesson-images')
      .upload(fileName, file)

    if (uploadError) {
      alert('Gagal mengunggah gambar: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('lesson-images').getPublicUrl(fileName)
    setImageUrl(data.publicUrl)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('lessons')
      .update({ 
        title, 
        content_type: contentType, 
        content, 
        order_index: orderIndex, 
        estimated_minutes: estimatedMinutes,
        image_url: imageUrl
      })
      .eq('id', lessonId)

    if (error) {
      alert('Gagal mengedit pelajaran: ' + error.message)
      setSaving(false)
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
              <input
                type="text" required
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition font-medium"
              />
            </div>

            {/* FITUR UPLOAD GAMBAR SAMPUL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Gambar Sampul (Opsional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-blue-400 transition bg-slate-50 relative overflow-hidden">
                {imageUrl ? (
                  <div className="text-center w-full">
                    <img src={imageUrl} alt="Preview" className="mx-auto h-40 object-cover rounded-lg mb-3 shadow-sm" />
                    <button type="button" onClick={() => setImageUrl('')} className="text-sm font-bold text-red-500 hover:text-red-700">
                      Hapus Gambar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="text-3xl mb-2">🖼️</div>
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-3 py-1 shadow-sm border border-slate-200">
                        <span>{uploading ? 'Mengunggah...' : 'Pilih Gambar'}</span>
                        <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, JPEG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Konten</label>
                <select
                  value={contentType} onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition font-medium"
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition font-medium"
                />
              </div>
            </div>

            {/* BAGIAN KONTEN DINAMIS */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {contentType === 'text' && 'Isi Teks Materi'}
                {contentType === 'video_link' && 'URL Video YouTube'}
                {contentType === 'simulation_embed' && 'URL Embed Simulasi PhET'}
                {contentType === 'web_embed' && 'URL Embed Aplikasi Web / Canva'}
                {contentType === 'external_link' && 'URL Tautan Eksternal'}
                {contentType === 'quiz' && 'Instruksi Kuis (Opsional)'}
              </label>
              
              {/* Jika Teks Bacaan, Gunakan RichTextEditor */}
              {contentType === 'text' ? (
                <RichTextEditor value={content} onChange={setContent} />
              ) : (
                <textarea
                  value={content} onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-mono text-sm leading-relaxed"
                  rows={contentType === 'quiz' ? 3 : 5} required={contentType !== 'quiz'}
                  placeholder="https://..."
                />
              )}
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
              type="submit" disabled={saving || uploading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:bg-slate-400 mt-4"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}