'use client'
import { useFormStatus } from 'react-dom'

export default function DeleteButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={className || "text-red-600 hover:underline text-sm"}
      onClick={(e) => {
        if (!confirm('Apakah Anda yakin ingin menghapus ini? Data yang dihapus tidak bisa dikembalikan.')) {
          e.preventDefault()
        }
      }}
    >
      {pending ? 'Menghapus...' : children}
    </button>
  )
}