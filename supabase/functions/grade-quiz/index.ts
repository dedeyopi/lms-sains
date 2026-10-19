import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Impor corsHeaders langsung dari SDK (pendekatan yang direkomendasikan Supabase)[reference:2]
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  // 1. Tangani preflight request (OPTIONS) untuk CORS
  // Ini adalah langkah krusial yang sebelumnya terlewat.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 2. Pastikan hanya menerima method POST untuk logika utama
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { answers, studentId, lessonId } = await req.json()

    // 3. Gunakan SERVICE_ROLE_KEY agar bisa membaca kunci jawaban dan menulis respons
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 4. Ambil kunci jawaban dari database
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer, points')
      .eq('lesson_id', lessonId)

    if (error || !questions) {
      return new Response(JSON.stringify({ error: 'Gagal mengambil soal' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    let totalScore = 0
    let maxScore = 0
    const results = []

    // 5. Hitung skor dan simpan jawaban
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

      await supabase.from('quiz_responses').insert({
        student_id: studentId,
        question_id: q.id,
        response: studentAnswer,
        is_correct: isCorrect
      })
    }

    // 6. Kembalikan hasil dengan header CORS yang benar
    return new Response(JSON.stringify({ 
      success: true, 
      totalScore, 
      maxScore, 
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})