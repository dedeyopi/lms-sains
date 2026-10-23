'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css' // <-- 1. Ganti CSS menjadi react-quill-new

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function RichTextEditor({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (val: string) => void 
}) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)

  // Fungsi untuk menangani upload gambar dari dalam editor
  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error } = await supabase.storage.from('lesson-images').upload(fileName, file)
      
      if (error) {
        alert('Gagal upload gambar: ' + error.message)
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from('lesson-images').getPublicUrl(fileName)
      
      // Sisipkan tag <img> ke dalam teks editor
      const imgTag = `<img src="${data.publicUrl}" alt="Ilustrasi" style="max-width: 100%; border-radius: 12px; margin: 20px 0;" />`
      onChange(value + imgTag)
      setUploading(false)
    }
  }

  // Konfigurasi toolbar editor
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'], // Tombol link dan gambar
        ['clean']
      ],
      handlers: {
        image: imageHandler // Gunakan custom handler untuk gambar
      }
    }
  }), [value]) // dependencies

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
      {uploading && <div className="bg-blue-50 text-blue-600 text-xs p-2 text-center animate-pulse">Sedang mengunggah gambar...</div>}
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        className="min-h-[300px]"
      />
    </div>
  )
}