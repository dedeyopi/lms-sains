'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCoursePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('physics')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error } = await supabase.from('courses').insert({
      title, description, subject, teacher_id: user.id, enrollment_code: generatedCode,
    })

    if (error) {
      alert('Gagal membuat kursus: ' + error.message)
      setLoading(false)
    } else {
      router.push('/dashboard/teacher')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/teacher" className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mb-6 transition">
          &larr; Batal dan Kembali
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🏫</div>
            <h1 className="text-2xl font-bold text-slate-800">Buat Kelas Baru</h1>
            <p className="text-slate-500 mt-2">Isi detail kelas yang akan Anda ampu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Judul Kelas</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
                required placeholder="Contoh: Biologi Dasar Kelas 10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Singkat</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                rows={4} placeholder="Jelaskan secara singkat apa yang akan dipelajari siswa..."
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
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:bg-slate-400 mt-4"
            >
              {loading ? 'Menyimpan...' : 'Buat Kelas'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}