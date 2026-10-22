import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })

  try {
    const { answers, studentId, lessonId } = await req.json()
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { data: questions, error } = await supabase.from('quiz_questions').select('*').eq('lesson_id', lessonId)
    if (error || !questions) throw new Error('Gagal mengambil soal')

    // Hapus jawaban lama jika siswa mengulang (opsional, tergantung kebijakan)
    const qIds = questions.map(q => q.id)
    await supabase.from('quiz_responses').delete().eq('student_id', studentId).in('question_id', qIds)

    let totalScore = 0
    let maxScore = 0
    const results = []

    for (const q of questions) {
      maxScore += q.points
      const studentAnswer = answers.find((a: any) => a.questionId === q.id)?.answer || ''
      let isCorrect = false

      // --- LOGIKA PENILAIAN BERDASARKAN TIPE SOAL ---
      if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
        // Jawaban siswa (misal: 'a') dibandingkan dengan kunci (misal: 'a')
        const correctKey = JSON.parse(q.correct_answer)
        isCorrect = studentAnswer === correctKey

      } else if (q.question_type === 'multiple_choice_complex') {
        // Siswa mengirim array of keys (misal: ['a', 'c'])
        const correctKeys = JSON.parse(q.correct_answer) // Array
        const studentKeys = Array.isArray(studentAnswer) ? studentAnswer : []
        
        // Cek apakah isi array sama persis (tanpa memedulikan urutan)
        isCorrect = correctKeys.length === studentKeys.length && 
                    correctKeys.every((k: string) => studentKeys.includes(k))

      } else if (q.question_type === 'matching') {
        // Siswa mengirim array of pairs (misal: [{left: 'A', right: '1'}, ...])
        // Kunci jawaban adalah array of right answers yang benar
        const correctPairs = JSON.parse(q.correct_answer)
        const studentPairs = Array.isArray(studentAnswer) ? studentAnswer : []
        
        let matchCount = 0
        studentPairs.forEach((pair: any) => {
          if (correctPairs.includes(pair.right)) matchCount++
        })
        // Anggap benar jika semua pasangan cocok
        isCorrect = matchCount === correctPairs.length
      }

      if (isCorrect) totalScore += q.points
      results.push({ questionId: q.id, isCorrect })

      await supabase.from('quiz_responses').insert({
        student_id: studentId, question_id: q.id, response: JSON.stringify(studentAnswer), is_correct: isCorrect
      })
    }

    await supabase.from('student_progress').upsert({
      student_id: studentId, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString()
    }, { onConflict: 'student_id, lesson_id' })

    return new Response(JSON.stringify({ success: true, totalScore, maxScore, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})