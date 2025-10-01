'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { PlayIcon, StarIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/solid'
import { HeartIcon, BookmarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { tmdb } from '@/services/tmdb'

interface MovieCardProps {
  id: string
  tmdbId: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string
  rating: number
  type: 'movie' | 'series' | 'anime'
  overview?: string
  genres?: string[]
  runtime?: number
  isVerified?: boolean
  userRating?: number
  inWatchlist?: boolean
  isWatched?: boolean
}

export default function MovieCard({
  id,
  tmdbId,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  rating,
  type,
  overview,
  genres,
  runtime,
  isVerified,
  userRating,
  inWatchlist = false,
  isWatched = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const year = new Date(releaseDate).getFullYear()
  const posterUrl = tmdb.getPosterUrl(posterPath, 'w500')
  const backdropUrl = tmdb.getBackdropUrl(backdropPath, 'w780')

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/${type}/${id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
          {/* Poster Image */}
          <div className="relative w-full h-full">
            <Image
              src={posterUrl}
              alt={title}
              fill
              className={`object-cover transition-all duration-700 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              priority={false}
            />
            
            {/* Loading Shimmer */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 animate-shimmer" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isVerified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-success-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-glow"
              >
                <CheckCircleIcon className="w-3 h-3" />
                Verificato
              </motion.div>
            )}
            {isWatched && (
              <div className="bg-primary-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold">
                Visto
              </div>
            )}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              className="bg-black/70 backdrop-blur-sm text-accent-400 px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <StarIcon className="w-4 h-4" />
              <span className="font-bold text-sm">{rating.toFixed(1)}</span>
            </motion.div>
          </div>

          {/* Hover Content */}
          <motion.div
            className="absolute inset-0 flex flex-col justify-end p-4 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Quick Actions */}
            <div className="flex gap-2 mb-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-500/90 backdrop-blur-sm text-white p-2 rounded-full shadow-cinema"
                onClick={(e) => {
                  e.preventDefault()
                  // Play trailer
                }}
              >
                <PlayIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`${
                  inWatchlist ? 'bg-accent-500/90' : 'bg-white/20'
                } backdrop-blur-sm text-white p-2 rounded-full`}
                onClick={(e) => {
                  e.preventDefault()
                  // Toggle watchlist
                }}
              >
                <BookmarkIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full"
                onClick={(e) => {
                  e.preventDefault()
                  // Add to favorites
                }}
              >
                <HeartIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Title and Info */}
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg line-clamp-2 drop-shadow-lg">
                {title}
              </h3>
              
              <div className="flex items-center gap-3 text-gray-200 text-sm">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {year}
                </span>
                {runtime && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {runtime} min
                  </span>
                )}
              </div>

              {genres && genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {userRating && (
                <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                  <span className="text-white text-sm">Il tuo voto:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(userRating / 2)
                            ? 'text-accent-400'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: isHovered
                ? '0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 30px rgba(239, 68, 68, 0.1)'
                : '0 0 0 rgba(0, 0, 0, 0)',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>

      {/* Bottom Title (Always Visible) */}
      <div className="mt-3 px-1">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">{year}</span>
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}