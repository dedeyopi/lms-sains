import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const { questionId, studentAnswer, studentId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Ambil kunci jawaban
  const { data: question } = await supabase
    .from('quiz_questions')
    .select('correct_answer, points')
    .eq('id', questionId)
    .single()

  const isCorrect = question?.correct_answer === studentAnswer

  // Simpan jawaban
  await supabase.from('quiz_responses').insert({
    student_id: studentId,
    question_id: questionId,
    response: studentAnswer,
    is_correct: isCorrect,
  })

  return new Response(JSON.stringify({ isCorrect }), {
    headers: { 'Content-Type': 'application/json' },
  })
})