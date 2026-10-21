import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import QuizPlayer from '@/app/components/QuizPlayer'

export const dynamic = 'force-dynamic'

// Fungsi bantuan untuk mengubah URL YouTube biasa menjadi URL embed
function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url
}

// Server Action untuk menandai pelajaran sebagai selesai
async function markAsCompleted(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const lessonId = formData.get('lessonId') as string
  const courseId = formData.get('courseId') as string

  // Simpan atau perbarui progres siswa
  await supabase.from('student_progress').upsert({
    student_id: user.id,
    lesson_id: lessonId,
    completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'student_id, lesson_id' })

  // Refresh halaman agar tombol berubah status
  revalidatePath(`/dashboard/courses/${courseId}/lessons/${lessonId}`)
}

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()

  // 1. Cek user login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Ambil detail pelajaran
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(`
      *,
      modules!inner (
        title,
        course_id
      )
    `)
    .eq('id', lessonId)
    .single()

  if (error || !lesson) return notFound()

  // 3. Ambil judul kursus
  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single()

  // 4. Cek apakah pelajaran ini sudah diselesaikan oleh siswa
  const { data: progress } = await supabase
    .from('student_progress')
    .select('completed')
    .eq('student_id', user.id)
    .eq('lesson_id', lessonId)
    .single()

  const isCompleted = progress?.completed === true

  // 5. Ambil soal kuis jika tipe pelajaran adalah kuis
  let quizQuestions: any[] = []
  if (lesson.content_type === 'quiz') {
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id, question_text, options')
      .eq('lesson_id', lessonId)
    
    if (questions) quizQuestions = questions
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Navigasi */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            href={`/dashboard/courses/${courseId}`} 
            className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-xl transition font-medium text-sm flex items-center gap-1"
          >
            &larr; Kembali
          </Link>
          <div className="text-sm text-slate-500 font-medium truncate">
            {course?.title} <span className="mx-2 text-slate-300">/</span> {lesson.modules.title}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Judul Pelajaran */}
        <div className="mb-8 text-center">
          <span className="inline-block mb-3 text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full uppercase font-bold tracking-wider border border-teal-100">
            {lesson.content_type.replace('_', ' ')}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{lesson.title}</h1>
        </div>

        {/* Konten Pembelajaran (Card) */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 mb-8 min-h-[300px]">
          
          {/* Teks Bacaan */}
          {lesson.content_type === 'text' && (
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
              {lesson.content.split('\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-6 text-lg">{paragraph}</p>
              ))}
            </div>
          )}

          {/* Video YouTube */}
          {lesson.content_type === 'video_link' && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <iframe src={getYouTubeEmbedUrl(lesson.content)} className="w-full h-full" allowFullScreen />
            </div>
          )}

          {/* Simulasi PhET */}
          {lesson.content_type === 'simulation_embed' && (
            <iframe src={lesson.content} className="w-full h-[500px] md:h-[600px] rounded-2xl border border-slate-200 shadow-sm" allowFullScreen />
          )}

          {/* Aplikasi Web / Canva */}
          {lesson.content_type === 'web_embed' && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-amber-800 font-medium">
                  Jika materi tidak muncul di bawah, buka langsung di tab baru.
                </p>
                <a href={lesson.content} target="_blank" rel="noopener noreferrer" className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 text-sm font-bold transition whitespace-nowrap">
                  ↗ Buka Tab Baru
                </a>
              </div>
              <iframe src={lesson.content} className="w-full h-[500px] md:h-[600px] rounded-2xl border border-slate-200 shadow-sm" allowFullScreen allow="camera; microphone; fullscreen; clipboard-read; clipboard-write" />
            </div>
          )}

          {/* Tautan Eksternal */}
          {lesson.content_type === 'external_link' && (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🔗</div>
              <p className="text-slate-600 mb-8 text-lg">Materi ini tersedia di tautan eksternal. Klik tombol di bawah untuk membukanya.</p>
              <a href={lesson.content} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 font-bold transition shadow-lg shadow-blue-600/30">
                Buka Materi Pelajaran
              </a>
            </div>
          )}

          {/* Kuis */}
          {lesson.content_type === 'quiz' && (
            <div>
              {quizQuestions.length > 0 ? (
                <QuizPlayer 
                  lessonId={lessonId} 
                  questions={quizQuestions} 
                  userId={user.id} 
                  courseId={courseId} // <-- PROP INI SUDAH DITAMBAHKAN
                />
              ) : (
                <div className="text-center p-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-slate-500 font-medium">Guru belum menambahkan soal untuk kuis ini.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Aksi (Selesai) - Sembunyikan jika tipe kuis karena kuis otomatis selesai */}
        {lesson.content_type !== 'quiz' && (
          <div className="flex justify-center border-t border-slate-200 pt-8 mt-4">
            {isCompleted ? (
              <div className="flex items-center gap-3 text-emerald-600 font-bold bg-emerald-50 px-8 py-4 rounded-2xl border border-emerald-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Pelajaran Selesai
              </div>
            ) : (
              <form action={markAsCompleted}>
                <input type="hidden" name="lessonId" value={lessonId} />
                <input type="hidden" name="courseId" value={courseId} />
                <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl hover:bg-blue-700 font-bold text-lg transition shadow-xl shadow-blue-600/30">
                  Tandai Selesai
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  )
}