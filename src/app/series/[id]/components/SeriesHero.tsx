'use client'

import Image from 'next/image'
import { Star, Play, Bookmark, Edit3 } from 'lucide-react'
import { TMDBSeries } from '@/services/tmdb'
import { tmdb } from '@/services/tmdb'
import { Button } from '@/components/ui/Button'

interface SeriesHeroProps {
  series: TMDBSeries
}

export default function SeriesHero({ series }: SeriesHeroProps) {
  const firstYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : ''
  const lastYear = series.last_air_date ? new Date(series.last_air_date).getFullYear() : 'Present'
  const yearRange = firstYear && lastYear !== firstYear ? `${firstYear}-${lastYear}` : firstYear

  const seasonsText = series.number_of_seasons === 1 
    ? '1 stagione' 
    : `${series.number_of_seasons} stagioni`

  return (
    <div className="relative h-[70vh] min-h-[600px] w-full overflow-hidden">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          src={tmdb.getBackdropUrl(series.backdrop_path, 'original')}
          alt={series.name}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end pb-12">
        <div className="flex gap-8 w-full max-w-7xl">
          {/* Poster */}
          <div className="hidden md:block flex-shrink-0">
            <div className="relative w-64 h-96 rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image
                src={tmdb.getPosterUrl(series.poster_path, 'w500')}
                alt={`${series.name} poster`}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                {series.name}
              </h1>
              {series.name !== series.original_name && (
                <p className="text-xl text-gray-300">
                  {series.original_name}
                </p>
              )}
            </div>

            {/* Tagline */}
            {series.tagline && (
              <p className="text-lg italic text-gray-300">
                "{series.tagline}"
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span>{yearRange}</span>
              <span>•</span>
              <span>{seasonsText}</span>
              <span>•</span>
              <span>{series.number_of_episodes} episodi</span>
              <span>•</span>
              <div className="flex gap-2">
                {series.genres.slice(0, 3).map((genre) => (
                  <span 
                    key={genre.id}
                    className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-6">
              {/* TMDB Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">
                    {series.vote_average.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  ({series.vote_count.toLocaleString()} voti)
                </span>
              </div>

              {/* TODO: Cinecheck Rating - collegare al database */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Cinecheck:</span>
                <span className="text-lg font-semibold text-primary">N/A</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Guarda Trailer
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
                <Bookmark className="w-5 h-5" />
                Aggiungi a Watchlist
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
                <Edit3 className="w-5 h-5" />
                Scrivi Recensione
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
