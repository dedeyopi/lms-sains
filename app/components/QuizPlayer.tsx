'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function QuizPlayer({ lessonId, questions, userId }: { lessonId: string, questions: any[], userId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const supabase = createClient()

  const handleSubmit = async () => {
    // Pastikan semua soal terjawab
    if (Object.keys(answers).length < questions.length) {
      alert('Harap jawab semua pertanyaan sebelum mengumpulkan.')
      return
    }

    setLoading(true)
    
    // Ubah format object answers menjadi array untuk Edge Function
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      answer: answers[qId]
    }))

    // Panggil Edge Function
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
      <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Kuis Selesai!</h2>
        <p className="text-gray-700 mb-4">Skor Anda:</p>
        <div className="text-5xl font-bold text-green-600 mb-6">
          {result.totalScore} / {result.maxScore}
        </div>
        <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Selesai
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg mb-4">{index + 1}. {q.question_text}</h3>
          <div className="space-y-2">
            {Object.entries(q.options).map(([key, value]) => (
              <label key={key} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={value as string}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  className="mr-3 w-4 h-4 text-blue-600"
                />
                <span className="uppercase font-bold mr-2 text-gray-500">{key}.</span>
                <span>{value as string}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Menilai Jawaban...' : 'Kumpulkan Jawaban'}
      </button>
    </div>
  )
}