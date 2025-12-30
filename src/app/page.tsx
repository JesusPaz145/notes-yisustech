'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Generate a random 8-character string
    const randomSlug = Math.random().toString(36).substring(2, 10)
    router.replace(`/${randomSlug}`)
  }, [router])

  return (
    <div className="flex items-center gap-3 text-red-500 animate-pulse font-medium">
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
      Asignando ID de nota...
    </div>
  )
}
