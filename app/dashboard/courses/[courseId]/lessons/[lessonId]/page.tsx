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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Navigasi */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="text-blue-600 hover:underline text-sm whitespace-nowrap"
          >
            &larr; Kembali ke Kursus
          </Link>
          <span className="text-gray-300">|</span>
          <div className="text-sm text-gray-500 truncate">
            {course?.title} / {lesson.modules.title}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Judul Pelajaran */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{lesson.title}</h1>
          <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase font-semibold">
            {lesson.content_type.replace('_', ' ')}
          </span>
        </div>

        {/* Konten Pembelajaran */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border mb-8">
          
          {/* Teks Bacaan */}
          {lesson.content_type === 'text' && (
            <div className="prose max-w-none text-gray-700">
              {lesson.content.split('\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          )}

          {/* Video YouTube */}
          {lesson.content_type === 'video_link' && (
            <div className="aspect-video w-full rounded overflow-hidden">
              <iframe
                src={getYouTubeEmbedUrl(lesson.content)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Simulasi PhET */}
          {lesson.content_type === 'simulation_embed' && (
            <iframe
              src={lesson.content}
              className="w-full h-[500px] md:h-[600px] border rounded"
              allowFullScreen
            />
          )}

          {/* Aplikasi Web / Canva */}
          {lesson.content_type === 'web_embed' && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-amber-800">
                  Sebagian situs membatasi tampilan di dalam iframe. Jika materi tidak muncul, buka langsung di tab baru.
                </p>
                <a
                  href={lesson.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm font-medium whitespace-nowrap"
                >
                  ↗ Buka di Tab Baru
                </a>
              </div>
              <iframe
                src={lesson.content}
                className="w-full h-[500px] md:h-[600px] border rounded"
                allowFullScreen
                allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
              />
            </div>
          )}

          {/* Tautan Eksternal */}
          {lesson.content_type === 'external_link' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-10 text-center">
              <p className="text-gray-700 mb-6 text-lg">
                Materi ini tersedia di tautan eksternal.
              </p>
              <a
                href={lesson.content}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                🔗 Buka Materi Pelajaran
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
                />
              ) : (
                <div className="text-center p-10 bg-gray-50 rounded">
                  <p className="text-gray-500">Guru belum menambahkan soal untuk kuis ini.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Aksi (Tandai Selesai) */}
        <div className="flex justify-end border-t pt-6">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-6 py-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Pelajaran Selesai
            </div>
          ) : (
            <form action={markAsCompleted}>
              <input type="hidden" name="lessonId" value={lessonId} />
              <input type="hidden" name="courseId" value={courseId} />
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
              >
                Tandai Selesai
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}