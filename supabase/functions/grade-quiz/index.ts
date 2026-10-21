import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { answers, studentId, lessonId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Ambil kunci jawaban
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer, points')
      .eq('lesson_id', lessonId)

    if (error || !questions) {
      return new Response(JSON.stringify({ error: 'Gagal mengambil soal' }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. HAPUS JAWABAN LAMA (Mencegah penumpukan nilai)
    const questionIds = questions.map(q => q.id)
    await supabase
      .from('quiz_responses')
      .delete()
      .eq('student_id', studentId)
      .in('question_id', questionIds)

    let totalScore = 0
    let maxScore = 0
    const results = []

    // 3. Nilai jawaban baru & simpan
    for (const q of questions) {
      maxScore += q.points
      const studentAnswer = answers.find((a: any) => a.questionId === q.id)?.answer || ''
      const isCorrect = studentAnswer === q.correct_answer
      
      if (isCorrect) totalScore += q.points

      results.push({ questionId: q.id, isCorrect, correctAnswer: q.correct_answer })

      await supabase.from('quiz_responses').insert({
        student_id: studentId,
        question_id: q.id,
        response: studentAnswer,
        is_correct: isCorrect
      })
    }

    // 4. Tandai selesai
    await supabase.from('student_progress').upsert({
      student_id: studentId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString()
    }, { onConflict: 'student_id, lesson_id' })

    return new Response(JSON.stringify({ 
      success: true, totalScore, maxScore, results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})