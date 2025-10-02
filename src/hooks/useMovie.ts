import { useQuery, useQueryClient } from '@tanstack/react-query'
import { tmdb } from '@/services/tmdb'
import type { TMDBMovie } from '@/services/tmdb'

export const MOVIE_QUERY_KEYS = {
  detail: (id: number) => ['movie', id] as const,
  similar: (id: number) => ['movie', id, 'similar'] as const,
  recommendations: (id: number) => ['movie', id, 'recommendations'] as const,
}

/**
 * Hook per fetch completo dei dati di un film
 * Include: videos, credits, keywords, images, similar, recommendations, watch providers
 */
export function useMovie(movieId: number) {
  return useQuery<TMDBMovie, Error>({
    queryKey: MOVIE_QUERY_KEYS.detail(movieId),
    queryFn: () => tmdb.getMovieComplete(movieId),
    staleTime: 1000 * 60 * 60, // 1 ora - i dati dei film cambiano raramente
    gcTime: 1000 * 60 * 60 * 24, // 24 ore
    retry: 2,
    enabled: !!movieId && movieId > 0,
  })
}

/**
 * Hook per prefetch dei dati del film
 * Utile per hover su card o link
 */
export function usePrefetchMovie() {
  const queryClient = useQueryClient()
  
  return (movieId: number) => {
    queryClient.prefetchQuery({
      queryKey: MOVIE_QUERY_KEYS.detail(movieId),
      queryFn: () => tmdb.getMovieComplete(movieId),
      staleTime: 1000 * 60 * 60,
    })
  }
}

// Helper per estrarre dati specifici
export function getMovieYear(releaseDate: string): string {
  return releaseDate ? new Date(releaseDate).getFullYear().toString() : 'N/A'
}

export function getMovieRuntime(runtime: number): string {
  if (!runtime) return 'N/A'
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  return `${hours}h ${minutes}m`
}

export function getMovieDirector(movie: TMDBMovie): string | null {
  const director = movie.credits?.crew.find(person => person.job === 'Director')
  return director?.name || null
}

export function getMovieMainCast(movie: TMDBMovie, limit: number = 10) {
  return movie.credits?.cast.slice(0, limit) || []
}

export function getMovieTrailer(movie: TMDBMovie): string | null {
  const trailer = movie.videos?.results.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  )
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null
}

export function getWatchProviders(movie: TMDBMovie, country: string = 'IT') {
  const providers = movie['watch/providers']?.results?.[country]
  return {
    link: providers?.link || null,
    streaming: providers?.flatrate || [],
    rent: providers?.rent || [],
    buy: providers?.buy || [],
  }
}
