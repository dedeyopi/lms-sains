'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function QuizPlayer({ 
  lessonId, questions, userId, courseId, previousResult 
}: { 
  lessonId: string, questions: any[], userId: string, courseId: string, previousResult?: { totalScore: number, maxScore: number } | null
}) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(previousResult || null)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Harap jawab semua pertanyaan sebelum mengumpulkan.')
      return
    }

    setLoading(true)
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      answer: answers[qId]
    }))

    const { data, error } = await supabase.functions.invoke('grade-quiz', {
      body: { answers: formattedAnswers, studentId: userId, lessonId: lessonId }
    })

    if (error) {
      alert('Gagal mengirim jawaban: ' + error.message)
      setLoading(false)
      return
    }

    setResult(data)
    setLoading(false)
  }

  if (result) {
    return (
      <div className="text-center p-8 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">Kuis Selesai</h2>
        <p className="text-emerald-700 mb-4">Skor Anda (Soal Esai akan dinilai manual oleh guru):</p>
        <div className="text-6xl font-black text-emerald-600 mb-6">
          {result.totalScore} <span className="text-3xl text-emerald-400">/ {result.maxScore}</span>
        </div>
        <button onClick={() => router.push(`/dashboard/courses/${courseId}`)} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg">Kembali ke Daftar Materi</button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {q.question_type.replace('_', ' ')}
            </span>
          </div>

          <h3 className="font-bold text-lg text-slate-800 mb-6 leading-relaxed">{q.question_text}</h3>
          
          <div className="space-y-3">
            
            {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && 
              Object.entries(q.options).map(([key, value]) => (
                <label key={key} className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${answers[q.id] === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name={`q-${q.id}`} value={key} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} className="mr-3 w-5 h-5 text-blue-600" />
                  <span className="uppercase font-bold mr-3 text-slate-400">{key}.</span>
                  <span className="text-slate-700 font-medium">{value as string}</span>
                </label>
              ))
            }

            {q.question_type === 'multiple_choice_complex' && 
              Object.entries(q.options).map(([key, value]) => {
                const currentAnswers = answers[q.id] || [];
                const isChecked = currentAnswers.includes(key);
                return (
                  <label key={key} className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${isChecked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={isChecked} onChange={(e) => {
                      const newAns = e.target.checked ? [...currentAnswers, key] : currentAnswers.filter((k: string) => k !== key);
                      setAnswers({ ...answers, [q.id]: newAns });
                    }} className="mr-3 w-5 h-5 text-blue-600 rounded" />
                    <span className="uppercase font-bold mr-3 text-slate-400">{key}.</span>
                    <span className="text-slate-700 font-medium">{value as string}</span>
                  </label>
                )
              })
            }

            {q.question_type === 'matching' && (
              <div className="grid gap-3">
                <p className="text-sm text-slate-500 italic mb-1">Jodohkan pernyataan di kiri dengan jawaban yang tepat di kanan.</p>
                {q.options.pairs.map((pair: any, i: number) => {
                  const currentMatch = answers[q.id] || [];
                  return (
                    <div key={i} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex-1 font-medium text-slate-700 w-full">{pair.left}</div>
                      <span className="text-slate-400 hidden sm:block">&rarr;</span>
                      <select 
                        className="flex-1 w-full p-2 border rounded-lg bg-white"
                        onChange={(e) => {
                          const newMatches = [...currentMatch.filter((m: any) => m.left !== pair.left), { left: pair.left, right: e.target.value }];
                          setAnswers({ ...answers, [q.id]: newMatches });
                        }}
                      >
                        <option value="">-- Pilih Pasangan --</option>
                        {q.options.pairs.map((p: any) => (
                          <option key={p.right} value={p.right}>{p.right}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            )}

            {/* --- FORM BARU: ISIAN SINGKAT --- */}
            {q.question_type === 'short_answer' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input 
                  type="text" 
                  value={answers[q.id] || ''} 
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} 
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Ketik jawaban singkat Anda di sini..." 
                />
              </div>
            )}

            {/* --- FORM BARU: ESAI --- */}
            {q.question_type === 'essay' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <textarea 
                  value={answers[q.id] || ''} 
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} 
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Ketik jawaban uraian Anda di sini..." 
                />
                <p className="text-xs text-slate-500 mt-2">*Jawaban esai akan diperiksa secara manual oleh guru.</p>
              </div>
            )}

          </div>
        </div>
      ))}

      <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-600/30 disabled:bg-slate-400">
        {loading ? 'Menilai Jawaban...' : 'Kumpulkan Jawaban Kuis'}
      </button>
    </div>
  )
}