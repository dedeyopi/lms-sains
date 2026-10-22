'use client'
import { useState, use, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ManageQuestionsPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>
}) {
  const { lessonId } = use(params)
  const supabase = createClient()
  
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // State Form
  const [type, setType] = useState('multiple_choice')
  const [text, setText] = useState('')
  const [points, setPoints] = useState(10)
  
  // State Dinamis untuk Opsi
  const [options, setOptions] = useState<Record<string, string>>({ a: '', b: '', c: '', d: '' })
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>('a')
  
  // State Khusus Menjodohkan & Isian
  const [matchPairs, setMatchPairs] = useState([
    { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }
  ])
  const [shortAnswerKey, setShortAnswerKey] = useState('')

  // Fungsi Fetch Soal dengan Error Handling
  const fetchQuestions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error("Gagal memuat soal:", error)
      alert("Gagal memuat soal: " + error.message)
    } else if (data) {
      setQuestions(data)
    }
    setLoading(false)
  }

  useEffect(() => { 
    if (lessonId) fetchQuestions() 
  }, [lessonId])

  // Reset form saat tipe berubah
  useEffect(() => {
    setOptions({ a: '', b: '', c: '', d: '' })
    setCorrectAnswer(type === 'multiple_choice_complex' ? [] : 'a')
    setShortAnswerKey('')
    if (type === 'true_false') {
      setOptions({ a: 'Benar', b: 'Salah' })
    }
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let finalOptions: any = options
    let finalCorrect: any = correctAnswer

    if (type === 'matching') {
      finalOptions = { pairs: matchPairs }
      finalCorrect = matchPairs.map(p => p.right)
    } else if (type === 'multiple_choice_complex') {
      finalCorrect = correctAnswer 
    } else if (type === 'short_answer') {
      finalOptions = {}
      finalCorrect = shortAnswerKey
    } else if (type === 'essay') {
      finalOptions = {}
      finalCorrect = 'ESSAY_NO_AUTO_GRADE'
    }

    const { error } = await supabase.from('quiz_questions').insert({
      lesson_id: lessonId,
      question_text: text,
      question_type: type,
      options: finalOptions,
      correct_answer: JSON.stringify(finalCorrect), 
      points,
    })

    if (error) {
      console.error("Gagal menyimpan soal:", error)
      alert('Gagal menyimpan soal: ' + error.message)
    } else {
      alert('Soal berhasil ditambahkan!')
      setText('')
      setOptions({ a: '', b: '', c: '', d: '' })
      setMatchPairs([{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }])
      setShortAnswerKey('')
      fetchQuestions() // Muat ulang daftar soal
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Hapus soal ini?')) {
      const { error } = await supabase.from('quiz_questions').delete().eq('id', id)
      if (error) alert("Gagal menghapus: " + error.message)
      else fetchQuestions()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => window.history.back()} className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mb-6">
          &larr; Kembali ke Manajemen Kelas
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* KOLOM KIRI: Daftar Soal */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Daftar Soal ({questions.length})</h2>
            
            {loading ? (
              <p className="text-slate-500 text-sm">Memuat soal...</p>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wide">
                        Soal {idx + 1} - {q.question_type.replace(/_/g, ' ')}
                      </span>
                      <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Hapus</button>
                    </div>
                    <p className="text-slate-800 font-medium text-sm mt-2">{q.question_text}</p>
                    <p className="text-xs text-slate-500 mt-2">Poin: {q.points}</p>
                  </div>
                ))}
                {questions.length === 0 && <p className="text-slate-500 text-sm italic">Belum ada soal.</p>}
              </div>
            )}
          </div>

          {/* KOLOM KANAN: Form Tambah Soal */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Buat Soal Baru</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Soal</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium">
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="multiple_choice_complex">Ganda Kompleks</option>
                    <option value="true_false">Benar / Salah</option>
                    <option value="matching">Menjodohkan</option>
                    <option value="short_answer">Isian Singkat</option>
                    <option value="essay">Esai (Uraian)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Poin</label>
                  <input type="number" min={1} value={points} onChange={(e) => setPoints(parseInt(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pertanyaan</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-slate-50 border rounded-xl" placeholder="Tulis pertanyaan..." />
              </div>

              {/* Render Form Berdasarkan Tipe Soal */}
              {type !== 'matching' && type !== 'short_answer' && type !== 'essay' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt} className="flex items-center gap-3">
                      <input 
                        type={type === 'multiple_choice_complex' ? 'checkbox' : 'radio'} 
                        name="correct" 
                        checked={type === 'multiple_choice_complex' ? (correctAnswer as string[]).includes(opt) : correctAnswer === opt}
                        onChange={() => {
                          if (type === 'multiple_choice_complex') {
                            const arr = correctAnswer as string[];
                            setCorrectAnswer(arr.includes(opt) ? arr.filter(i => i !== opt) : [...arr, opt]);
                          } else {
                            setCorrectAnswer(opt);
                          }
                        }}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="uppercase font-bold text-slate-500 w-4">{opt}.</span>
                      <input type="text" value={options[opt] || ''} onChange={(e) => setOptions({...options, [opt]: e.target.value})} required className="flex-1 px-3 py-1.5 border rounded-lg text-sm" placeholder={`Isi pilihan ${opt.toUpperCase()}`} />
                    </div>
                  ))}
                </div>
              )}

              {type === 'matching' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs text-slate-500 mb-2">Isi pasangan yang benar (Kiri dan Kanan).</p>
                  {matchPairs.map((pair, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" value={pair.left} onChange={(e) => {
                        const newPairs = [...matchPairs];
                        newPairs[i].left = e.target.value;
                        setMatchPairs(newPairs);
                      }} required className="flex-1 px-3 py-1.5 border rounded-lg text-sm" placeholder="Sisi Kiri (A)" />
                      <span className="text-slate-400">&rarr;</span>
                      <input type="text" value={pair.right} onChange={(e) => {
                        const newPairs = [...matchPairs];
                        newPairs[i].right = e.target.value;
                        setMatchPairs(newPairs);
                      }} required className="flex-1 px-3 py-1.5 border rounded-lg text-sm" placeholder="Pasangan Benar" />
                    </div>
                  ))}
                </div>
              )}

              {type === 'short_answer' && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kunci Jawaban (Teks)</label>
                  <input type="text" value={shortAnswerKey} onChange={(e) => setShortAnswerKey(e.target.value)} required className="w-full px-3 py-2 border rounded-lg" placeholder="Contoh: Karbon Dioksida" />
                  <p className="text-xs text-slate-500 mt-2">*Sistem akan mencocokkan jawaban siswa secara otomatis.</p>
                </div>
              )}

              {type === 'essay' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <p className="text-sm text-amber-800 font-medium">Soal esai tidak dapat dinilai otomatis. Jawaban siswa akan disimpan untuk diperiksa manual.</p>
                </div>
              )}

              <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-400">
                {saving ? 'Menyimpan...' : 'Simpan Soal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}