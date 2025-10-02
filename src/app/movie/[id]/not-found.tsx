import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-3xl font-semibold">Film non trovato</h2>
          <p className="text-muted-foreground text-lg">
            Il film che stai cercando non esiste o è stato rimosso.
          </p>
        </div>
        
        <Link href="/">
          <Button variant="default">Torna alla Home</Button>
        </Link>
      </div>
    </div>
  )
}
