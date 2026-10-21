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
      setLoading(false)
    } else {
      alert('Soal berhasil ditambahkan!')
      setQuestionText('')
      setOptions({ a: '', b: '', c: '', d: '' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mb-6 transition">
          &larr; Kembali ke Manajemen Kelas
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📝</div>
            <h1 className="text-2xl font-bold text-slate-800">Buat Soal Kuis</h1>
            <p className="text-slate-500 mt-2">Tambahkan pertanyaan pilihan ganda untuk dievaluasi secara otomatis.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Pertanyaan</label>
              <textarea
                value={questionText} onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                required rows={4}
                placeholder="Tuliskan pertanyaan di sini..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {['a', 'b', 'c', 'd'].map((opt) => (
                <div key={opt}>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Pilihan {opt}</label>
                  <input
                    type="text" required
                    value={options[opt as keyof typeof options]}
                    onChange={(e) => setOptions({ ...options, [opt]: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-medium"
                    placeholder={`Isi pilihan ${opt.toUpperCase()}`}
                  />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <label className="block text-sm font-bold text-blue-800 mb-2">Kunci Jawaban yang Benar</label>
              <select
                value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-bold text-blue-700"
              >
                <option value="a">Pilihan A</option>
                <option value="b">Pilihan B</option>
                <option value="c">Pilihan C</option>
                <option value="d">Pilihan D</option>
              </select>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/30 disabled:bg-slate-400 mt-2"
            >
              {loading ? 'Menyimpan...' : 'Simpan Soal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}