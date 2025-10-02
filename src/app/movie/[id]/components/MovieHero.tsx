'use client'

import Image from 'next/image'
import { Star, Play, Bookmark, Edit3 } from 'lucide-react'
import { TMDBMovie } from '@/services/tmdb'
import { tmdb } from '@/services/tmdb'
import { getMovieYear, getMovieRuntime } from '@/hooks/useMovie'
import { Button } from '@/components/ui/Button'

interface MovieHeroProps {
  movie: TMDBMovie
}

export default function MovieHero({ movie }: MovieHeroProps) {
  const year = getMovieYear(movie.release_date)
  const runtime = getMovieRuntime(movie.runtime)

  return (
    <div className="relative h-[70vh] min-h-[600px] w-full overflow-hidden">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          src={tmdb.getBackdropUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
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
                src={tmdb.getPosterUrl(movie.poster_path, 'w500')}
                alt={`${movie.title} poster`}
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
                {movie.title}
              </h1>
              {movie.title !== movie.original_title && (
                <p className="text-xl text-gray-300">
                  {movie.original_title}
                </p>
              )}
            </div>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-lg italic text-gray-300">
                "{movie.tagline}"
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span>{year}</span>
              <span>•</span>
              <span>{runtime}</span>
              <span>•</span>
              <div className="flex gap-2">
                {movie.genres.slice(0, 3).map((genre) => (
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
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  ({movie.vote_count.toLocaleString()} voti)
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
