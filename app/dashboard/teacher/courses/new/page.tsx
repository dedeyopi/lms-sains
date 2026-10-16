'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

    const { error } = await supabase.from('courses').insert({
      title,
      description,
      subject,
      teacher_id: user.id,
    })

    if (error) {
      alert('Gagal membuat kursus: ' + error.message)
    } else {
      alert('Kursus berhasil dibuat!')
      router.push('/dashboard/teacher')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Buat Kursus Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Judul Kursus</label>
          <input
            type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded" required
            placeholder="Contoh: Fisika Dasar - Gerak Newton"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded" rows={3}
            placeholder="Deskripsi singkat tentang kursus ini..."
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mata Pelajaran</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="physics">Fisika</option>
            <option value="chemistry">Kimia</option>
            <option value="biology">Biologi</option>
            <option value="general">Umum</option>
          </select>
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Menyimpan...' : 'Buat Kursus'}
        </button>
      </form>
    </div>
  )
}