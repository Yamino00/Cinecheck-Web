import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tmdb } from '@/services/tmdb'
import MovieHero from './components/MovieHero'
import MovieInfo from './components/MovieInfo'
import MovieMedia from './components/MovieMedia'
import MovieReviews from './components/MovieReviews'
import MovieRecommendations from './components/MovieRecommendations'

interface MoviePageProps {
  params: {
    id: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  try {
    const movieId = parseInt(params.id)
    if (isNaN(movieId)) return { title: 'Film non trovato' }

    const movie = await tmdb.getMovieComplete(movieId)
    
    return {
      title: `${movie.title} (${new Date(movie.release_date).getFullYear()}) - Cinecheck`,
      description: movie.overview || `Guarda ${movie.title} su Cinecheck`,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: [
          {
            url: tmdb.getBackdropUrl(movie.backdrop_path, 'original'),
            width: 1920,
            height: 1080,
            alt: movie.title,
          },
        ],
        type: 'video.movie',
      },
      twitter: {
        card: 'summary_large_image',
        title: movie.title,
        description: movie.overview,
        images: [tmdb.getBackdropUrl(movie.backdrop_path, 'original')],
      },
    }
  } catch (error) {
    return { title: 'Film non trovato' }
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = parseInt(params.id)
  
  if (isNaN(movieId)) {
    notFound()
  }

  try {
    const movie = await tmdb.getMovieComplete(movieId)

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <MovieHero movie={movie} />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 space-y-12">
          {/* Info Section */}
          <MovieInfo movie={movie} />

          {/* Media Section */}
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <MovieMedia movie={movie} />
          </Suspense>

          {/* Reviews Section */}
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <MovieReviews movieId={movieId} movieTitle={movie.title} />
          </Suspense>

          {/* Recommendations Section */}
          {movie.similar?.results && movie.similar.results.length > 0 && (
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
              <MovieRecommendations movies={movie.similar.results} />
            </Suspense>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading movie:', error)
    notFound()
  }
}
