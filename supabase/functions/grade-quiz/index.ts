import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Cek method harus POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { answers, studentId, lessonId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Gunakan service role agar bisa baca kunci jawaban
    )

    // 1. Ambil kunci jawaban untuk pelajaran ini
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer, points')
      .eq('lesson_id', lessonId)

    if (error || !questions) {
      return new Response(JSON.stringify({ error: 'Gagal mengambil soal' }), { status: 500 })
    }

    let totalScore = 0
    let maxScore = 0
    const results = []

    // 2. Nilai setiap jawaban siswa
    for (const q of questions) {
      maxScore += q.points
      const studentAnswer = answers.find((a: any) => a.questionId === q.id)?.answer || ''
      const isCorrect = studentAnswer === q.correct_answer
      
      if (isCorrect) totalScore += q.points

      results.push({
        questionId: q.id,
        isCorrect,
        correctAnswer: q.correct_answer
      })

      // 3. Simpan jawaban siswa ke database
      await supabase.from('quiz_responses').insert({
        student_id: studentId,
        question_id: q.id,
        response: studentAnswer,
        is_correct: isCorrect
      })
    }

    // 4. Kembalikan hasil
    return new Response(JSON.stringify({ 
      success: true, 
      totalScore, 
      maxScore, 
      results 
    }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})