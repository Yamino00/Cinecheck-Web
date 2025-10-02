'use client'

import { MessageSquare, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface MovieReviewsProps {
  movieId: number
  movieTitle: string
}

export default function MovieReviews({ movieId, movieTitle }: MovieReviewsProps) {
  // TODO: Collegare al database Supabase per fetch recensioni
  // Per ora mostriamo uno stato empty con call-to-action

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Recensioni</h3>
        <Button>
          <MessageSquare className="w-4 h-4 mr-2" />
          Scrivi Recensione
        </Button>
      </div>

      {/* Empty State - TODO: Sostituire con recensioni reali */}
      <Card className="p-12 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Star className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-semibold">Nessuna recensione ancora</h4>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sii il primo a recensire "{movieTitle}"! Completa il quiz per sbloccare la possibilità di scrivere una recensione verificata.
          </p>
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <Button variant="default">
            Fai il Quiz
          </Button>
          <Button variant="outline">
            Scrivi Recensione
          </Button>
        </div>
      </Card>

      {/* TODO: Implementare:
        - Tab Verified/All reviews
        - Review cards con avatar, rating, excerpt
        - Filtri (Recent, Top Rated, Most Helpful)
        - Paginazione/Infinite scroll
        - Like system per recensioni
      */}
    </section>
  )
}
