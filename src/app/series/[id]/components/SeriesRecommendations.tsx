'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { TMDBSeries } from '@/services/tmdb'
import { tmdb } from '@/services/tmdb'
import { Card } from '@/components/ui/Card'

interface SeriesRecommendationsProps {
  series: TMDBSeries[]
}

export default function SeriesRecommendations({ series }: SeriesRecommendationsProps) {
  const displaySeries = series.slice(0, 12)

  return (
    <section className="space-y-6">
      <h3 className="text-2xl font-bold">Serie Simili</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displaySeries.map((show) => (
          <Link 
            key={show.id} 
            href={`/series/${show.id}`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative aspect-[2/3] bg-muted">
                <Image
                  src={tmdb.getPosterUrl(show.poster_path, 'w342')}
                  alt={show.name}
                  fill
                  className="object-cover"
                />
                
                {/* Overlay con rating */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                    <h4 className="font-semibold text-white text-sm line-clamp-2">
                      {show.name}
                    </h4>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {show.vote_average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
