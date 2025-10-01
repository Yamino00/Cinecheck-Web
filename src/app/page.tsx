'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import MovieCard from '@/components/MovieCard'
import { tmdb, type TMDBMovie } from '@/services/tmdb'
import { PlayIcon, SparklesIcon, FireIcon, StarIcon, FilmIcon } from '@heroicons/react/24/solid'

export default function HomePage() {
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('popular')

  useEffect(() => {
    loadMovies()
  }, [])

  const loadMovies = async () => {
    try {
      setLoading(true)
      const [popular, trending, topRated] = await Promise.all([
        tmdb.getPopularMovies(),
        tmdb.getTrending('movie', 'week'),
        tmdb.getTopRatedMovies()
      ])
      
      setPopularMovies(popular.results.slice(0, 12))
      setTrendingMovies(trending.results.slice(0, 12))
      setTopRatedMovies(topRated.results.slice(0, 12))
    } catch (error) {
      console.error('Error loading movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'popular', name: 'Popolari', icon: FireIcon, color: 'primary' },
    { id: 'trending', name: 'Trending', icon: SparklesIcon, color: 'neon-pink' },
    { id: 'toprated', name: 'Top Rated', icon: StarIcon, color: 'accent' },
  ]

  const getMoviesToShow = () => {
    switch (selectedCategory) {
      case 'trending':
        return trendingMovies
      case 'toprated':
        return topRatedMovies
      default:
        return popularMovies
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cinema-gradient opacity-10" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-primary-500 p-4 rounded-full shadow-cinema"
              >
                <FilmIcon className="w-12 h-12 text-white" />
              </motion.div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 mb-6 animate-shimmer bg-[length:200%_auto]">
              CINECHECK
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Recensioni cinematografiche <span className="text-accent-400 font-semibold">verificate</span> e <span className="text-success-400 font-semibold">autentiche</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-primary-500 text-white rounded-full font-semibold shadow-cinema hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
              >
                <PlayIcon className="w-5 h-5" />
                Inizia il Quiz
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Scopri Come Funziona
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Tabs */}
      <section className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id
              
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-6 py-3 rounded-full font-semibold flex items-center gap-2 whitespace-nowrap transition-all
                    ${isActive 
                      ? `bg-${category.color}-500 text-white shadow-${category.color === 'neon-pink' ? 'neon' : category.color}` 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {category.name}
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-dark-800 animate-pulse">
                <div className="w-full h-full bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 animate-shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
          >
            {getMoviesToShow().map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MovieCard
                  id={movie.id.toString()}
                  tmdbId={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  backdropPath={movie.backdrop_path}
                  releaseDate={movie.release_date}
                  rating={movie.vote_average}
                  type="movie"
                  overview={movie.overview}
                  genres={[]} // Verrà popolato con i dati completi
                  isVerified={Math.random() > 0.5} // Demo
                  inWatchlist={Math.random() > 0.7} // Demo
                  isWatched={Math.random() > 0.8} // Demo
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary-900/20 via-accent-900/20 to-primary-900/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="space-y-2"
            >
              <div className="text-4xl font-bold text-accent-400">10K+</div>
              <div className="text-gray-400">Film Verificati</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="space-y-2"
            >
              <div className="text-4xl font-bold text-primary-400">50K+</div>
              <div className="text-gray-400">Recensioni</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="space-y-2"
            >
              <div className="text-4xl font-bold text-success-400">98%</div>
              <div className="text-gray-400">Accuratezza</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="space-y-2"
            >
              <div className="text-4xl font-bold text-secondary-400">5K+</div>
              <div className="text-gray-400">Utenti Attivi</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}