'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, X } from 'lucide-react'
import { TMDBMovie } from '@/services/tmdb'
import { tmdb } from '@/services/tmdb'
import { getMovieTrailer } from '@/hooks/useMovie'

interface MovieMediaProps {
  movie: TMDBMovie
}

export default function MovieMedia({ movie }: MovieMediaProps) {
  const trailerUrl = getMovieTrailer(movie)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const backdrops = movie.images?.backdrops.slice(0, 12) || []

  return (
    <div className="space-y-8">
      {/* Trailer */}
      {trailerUrl && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Trailer</h3>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={trailerUrl}
              title={`${movie.title} Trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Gallery */}
      {backdrops.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Immagini</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {backdrops.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(tmdb.getBackdropUrl(image.file_path, 'original'))}
                className="relative aspect-video rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all group"
              >
                <Image
                  src={tmdb.getBackdropUrl(image.file_path, 'w780')}
                  alt={`${movie.title} screenshot ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative max-w-7xl w-full aspect-video">
            <Image
              src={selectedImage}
              alt="Full size image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
