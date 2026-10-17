'use client'
import { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ManageQuestionsPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>
}) {
  const { lessonId } = use(params)
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState({ a: '', b: '', c: '', d: '' })
  const [correctAnswer, setCorrectAnswer] = useState('a')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('quiz_questions').insert({
      lesson_id: lessonId,
      question_text: questionText,
      question_type: 'multiple_choice',
      options: options,
      correct_answer: options[correctAnswer as keyof typeof options],
      points: 10,
    })

    if (error) {
      alert('Gagal menyimpan soal: ' + error.message)
    } else {
      alert('Soal berhasil ditambahkan!')
      setQuestionText('')
      setOptions({ a: '', b: '', c: '', d: '' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm mb-4">
        &larr; Kembali
      </button>

      <h1 className="text-2xl font-bold mb-6">Buat Soal Kuis</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block mb-1 font-medium">Pertanyaan</label>
          <textarea
            value={questionText} onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-2 border rounded" required rows={3}
            placeholder="Contoh: Apa penyebab utama pemanasan global?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['a', 'b', 'c', 'd'].map((opt) => (
            <div key={opt}>
              <label className="block mb-1 font-medium uppercase">Pilihan {opt}</label>
              <input
                type="text" required
                value={options[opt as keyof typeof options]}
                onChange={(e) => setOptions({ ...options, [opt]: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block mb-1 font-medium">Kunci Jawaban</label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="a">Pilihan A</option>
            <option value="b">Pilihan B</option>
            <option value="c">Pilihan C</option>
            <option value="d">Pilihan D</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? 'Menyimpan...' : 'Simpan Soal'}
        </button>
      </form>
    </div>
  )
}