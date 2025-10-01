'use client'

import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { tmdb } from '@/services/tmdb'
import { Database } from '@/types/database'

// Types for database operations
type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Configurazione Query Client ottimizzata
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Cache per 5 minuti per default
      staleTime: 5 * 60 * 1000,
      // Mantieni cache per 10 minuti
      gcTime: 10 * 60 * 1000, 
      // Retry intelligente
      retry: (failureCount, error: any) => {
        // Non fare retry per errori 4xx
        if (error?.status >= 400 && error?.status < 500) return false
        // Max 3 retry per altri errori
        return failureCount < 3
      },
      // Refetch automatico quando la finestra torna in focus
      refetchOnWindowFocus: true,
      // Prefetch in background quando i dati stanno per scadere
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry per le mutazioni critiche
      retry: 1,
    },
  },
})

// Cache keys centralizzate
export const QUERY_KEYS = {
  // Movies
  movies: {
    all: ['movies'] as const,
    popular: (page = 1) => [...QUERY_KEYS.movies.all, 'popular', page] as const,
    trending: (timeWindow = 'week', page = 1) => [...QUERY_KEYS.movies.all, 'trending', timeWindow, page] as const,
    topRated: (page = 1) => [...QUERY_KEYS.movies.all, 'top-rated', page] as const,
    detail: (id: number) => [...QUERY_KEYS.movies.all, 'detail', id] as const,
    search: (query: string, page = 1) => [...QUERY_KEYS.movies.all, 'search', query, page] as const,
    recommendations: (id: number) => [...QUERY_KEYS.movies.all, 'recommendations', id] as const,
  },
  // Series
  series: {
    all: ['series'] as const,
    popular: (page = 1) => [...QUERY_KEYS.series.all, 'popular', page] as const,
    trending: (timeWindow = 'week', page = 1) => [...QUERY_KEYS.series.all, 'trending', timeWindow, page] as const,
    topRated: (page = 1) => [...QUERY_KEYS.series.all, 'top-rated', page] as const,
    detail: (id: number) => [...QUERY_KEYS.series.all, 'detail', id] as const,
  },
  // User data
  user: {
    all: ['user'] as const,
    profile: (id: string) => [...QUERY_KEYS.user.all, 'profile', id] as const,
    reviews: (id: string) => [...QUERY_KEYS.user.all, 'reviews', id] as const,
    watchlist: (id: string) => [...QUERY_KEYS.user.all, 'watchlist', id] as const,
    stats: (id: string) => [...QUERY_KEYS.user.all, 'stats', id] as const,
  },
  // Reviews
  reviews: {
    all: ['reviews'] as const,
    byContent: (contentId: string) => [...QUERY_KEYS.reviews.all, 'content', contentId] as const,
    byUser: (userId: string) => [...QUERY_KEYS.reviews.all, 'user', userId] as const,
  },
  // Quiz
  quiz: {
    all: ['quiz'] as const,
    questions: (contentId: string) => [...QUERY_KEYS.quiz.all, 'questions', contentId] as const,
    attempts: (userId: string, contentId: string) => [...QUERY_KEYS.quiz.all, 'attempts', userId, contentId] as const,
  }
} as const

// Provider Component
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ReactQueryDevtools va installato separatamente per development */}
    </QueryClientProvider>
  )
}

// Custom hooks per data fetching ottimizzato

// Movies hooks
export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.movies.popular(page),
    queryFn: () => tmdb.getPopularMovies(page),
    staleTime: 15 * 60 * 1000, // 15 minuti per contenuti popolari
    gcTime: 30 * 60 * 1000, // Mantieni in cache per 30 minuti
  })
}

export function useTrendingMovies(timeWindow: 'day' | 'week' = 'week', page = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.movies.trending(timeWindow, page),
    queryFn: () => tmdb.getTrending('movie', timeWindow),
    staleTime: timeWindow === 'day' ? 2 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000, // 2h per daily, 6h per weekly
    gcTime: 24 * 60 * 60 * 1000, // 24 ore
  })
}

export function useMovieDetail(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.movies.detail(id),
    queryFn: () => tmdb.getMovie(id), // Corretto: usa getMovie invece di getMovieDetails
    staleTime: 60 * 60 * 1000, // 1 ora - i dettagli cambiano raramente
    gcTime: 24 * 60 * 60 * 1000, // 24 ore
    enabled: !!id, // Solo se abbiamo un ID valido
  })
}

export function useMovieSearch(query: string, page = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.movies.search(query, page),
    queryFn: () => tmdb.searchMovies(query, page),
    staleTime: 10 * 60 * 1000, // 10 minuti per risultati di ricerca
    gcTime: 30 * 60 * 1000,
    enabled: query.length >= 2, // Solo se la query è abbastanza lunga
  })
}

// User data hooks
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.user.profile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minuti
    gcTime: 15 * 60 * 1000,
    enabled: !!userId,
  })
}

export function useUserReviews(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.user.reviews(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          content:contents(title, poster_path, type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minuti
    gcTime: 10 * 60 * 1000,
    enabled: !!userId,
  })
}

// Mutations con ottimizzazioni
export function useCreateReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (reviewData: ReviewInsert) => {
      const { data, error } = await (supabase as any)
        .from('reviews')
        .insert(reviewData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data: any) => {
      // Invalida e aggiorna cache correlate
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.reviews(data.user_id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.byContent(data.content_id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.stats(data.user_id) })
    },
    onError: (error) => {
      console.error('Error creating review:', error)
    }
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      updates 
    }: { 
      userId: string
      updates: ProfileUpdate
    }) => {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data: any) => {
      // Aggiorna immediatamente la cache del profilo
      queryClient.setQueryData(QUERY_KEYS.user.profile(data.id), data)
    },
  })
}

// Utility per prefetching intelligente
export function usePrefetchMovieDetail() {
  const queryClient = useQueryClient()
  
  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.movies.detail(id),
      queryFn: () => tmdb.getMovie(id), // Corretto: usa getMovie
      staleTime: 60 * 60 * 1000, // 1 ora
    })
  }
}

// Hook per invalidazione batch
export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  
  return {
    invalidateUserData: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all })
    },
    invalidateMovieData: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.movies.all })
    },
    invalidateAll: () => {
      queryClient.clear()
    }
  }
}

// Background sync per dati critici
export function useBackgroundSync() {
  const queryClient = useQueryClient()
  
  const syncCriticalData = async () => {
    // Sync dati utente se autenticato
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.user.profile(session.user.id),
        queryFn: async () => {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          return data
        },
      })
    }
    
    // Prefetch contenuti popolari
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.movies.popular(1),
      queryFn: () => tmdb.getPopularMovies(1),
    })
  }
  
  return { syncCriticalData }
}