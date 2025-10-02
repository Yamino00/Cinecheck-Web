'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Movie page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Oops! Qualcosa è andato storto</h1>
          <p className="text-muted-foreground text-lg">
            Non siamo riusciti a caricare questo film.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            Riprova
          </Button>
          <Link href="/">
            <Button variant="outline">Torna alla Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
