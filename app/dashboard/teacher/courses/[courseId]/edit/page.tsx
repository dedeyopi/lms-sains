'use client'
import { useState, use, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = use(params)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('physics')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()
      if (data) {
        setTitle(data.title)
        setDescription(data.description || '')
        setSubject(data.subject)
      }
      setLoading(false)
    }
    fetchCourse()
  }, [courseId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('courses')
      .update({ title, description, subject })
      .eq('id', courseId)

    if (error) {
      alert('Gagal mengedit kelas: ' + error.message)
      setSaving(false)
    } else {
      router.push(`/dashboard/teacher/courses/${courseId}`)
      router.refresh()
    }
  }

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Memuat data...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/teacher/courses/${courseId}`} className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mb-6 transition">
          &larr; Batal dan Kembali
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">✏️</div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Kelas</h1>
            <p className="text-slate-500 mt-2">Perbarui informasi kelas Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Judul Kelas</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Singkat</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mata Pelajaran</label>
              <select
                value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
              >
                <option value="physics">⚛️ Fisika</option>
                <option value="chemistry">🧪 Kimia</option>
                <option value="biology">🌿 Biologi</option>
                <option value="general">🔬 Umum / Lainnya</option>
              </select>
            </div>

            <button
              type="submit" disabled={saving}
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