'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function QuizPlayer({ 
  lessonId, 
  questions, 
  userId,
  courseId // Pastikan prop ini ada
}: { 
  lessonId: string, 
  questions: any[], 
  userId: string,
  courseId: string 
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
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

    // Panggil Edge Function
    const { data, error } = await supabase.functions.invoke('grade-quiz', {
      body: { answers: formattedAnswers, studentId: userId, lessonId: lessonId }
    })

    if (error) {
      alert('Gagal mengirim jawaban. Pastikan koneksi internet stabil. Error: ' + error.message)
      setLoading(false)
      return
    }

    // Set hasil untuk menampilkan layar skor
    setResult(data)
    setLoading(false)
  }

  // JIKA RESULT ADA, TAMPILKAN LAYAR SKOR
  if (result) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Kuis Selesai! 🎉</h2>
        <p className="text-gray-700 mb-4">Skor Anda:</p>
        <div className="text-6xl font-black text-green-600 mb-6">
          {result.totalScore} <span className="text-3xl text-green-400">/ {result.maxScore}</span>
        </div>
        
        {/* TOMBOL INI YANG MENGARAHKAN KEMBALI KE DAFTAR MATERI */}
        <button 
          onClick={() => router.push(`/dashboard/courses/${courseId}`)} 
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/30"
        >
          Kembali ke Daftar Materi
        </button>
      </div>
    )
  }

  // JIKA BELUM SELESAI, TAMPILKAN SOAL
  return (
    <div className="space-y-6">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-4">{index + 1}. {q.question_text}</h3>
          <div className="space-y-3">
            {Object.entries(q.options).map(([key, value]) => (
              <label key={key} className="flex items-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={value as string}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="uppercase font-bold mr-3 text-slate-400">{key}.</span>
                <span className="text-slate-700 font-medium">{value as string}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:bg-slate-400"
      >
        {loading ? 'Menilai Jawaban...' : 'Kumpulkan Jawaban'}
      </button>
    </div>
  )
}