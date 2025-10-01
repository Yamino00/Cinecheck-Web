import { supabase } from '../lib/supabase'
import { tmdb, TMDBMovie, TMDBSeries } from './tmdb'

/**
 * Maps TMDB movie/series data to Supabase contents table format
 * Handles the mapping from 'cast' to 'cast_members'
 */
export function mapTMDBToContent(
  tmdbData: any, // Usiamo any per semplificare i tipi
  type: 'movie' | 'series' | 'anime'
) {
  const isMovie = 'title' in tmdbData
  
  return {
    tmdb_id: tmdbData.id,
    type,
    title: isMovie ? tmdbData.title : tmdbData.name,
    original_title: isMovie ? tmdbData.original_title : tmdbData.original_name,
    overview: tmdbData.overview,
    poster_path: tmdbData.poster_path,
    backdrop_path: tmdbData.backdrop_path,
    release_date: isMovie ? tmdbData.release_date : tmdbData.first_air_date,
    runtime: isMovie ? tmdbData.runtime : null,
    genres: tmdbData.genres || [],
    // 🎯 MAPPING CRITICO: cast → cast_members
    cast_members: tmdbData.credits?.cast || [],
    crew: tmdbData.credits?.crew || [],
    videos: tmdbData.videos?.results || [],
    vote_average: tmdbData.vote_average,
    vote_count: tmdbData.vote_count,
    popularity: tmdbData.popularity,
    seasons: !isMovie ? tmdbData.seasons : null,
    episodes_count: !isMovie ? tmdbData.number_of_episodes : null,
    status: tmdbData.status,
    budget: isMovie ? tmdbData.budget : null,
    revenue: isMovie ? tmdbData.revenue : null,
    production_companies: isMovie ? tmdbData.production_companies : [],
    keywords: [],
    last_sync_at: new Date().toISOString()
  }
}

/**
 * Saves or updates content from TMDB in the database
 */
export async function saveContentFromTMDB(
  tmdbId: number,
  type: 'movie' | 'series' | 'anime'
): Promise<any> {
  try {
    // Check if content already exists
    const { data: existingContent } = await supabase
      .from('contents')
      .select('id, last_sync_at')
      .eq('tmdb_id', tmdbId)
      .maybeSingle() // Usa maybeSingle invece di single

    // Get fresh data from TMDB
    const tmdbData = type === 'movie' 
      ? await tmdb.getMovie(tmdbId)
      : await tmdb.getSeries(tmdbId)

    // Map TMDB data to our schema
    const contentData = mapTMDBToContent(tmdbData, type)

    if (existingContent) {
      // Update existing content - cast esplicito per bypassare problemi di tipo
      const { data, error } = await (supabase as any)
        .from('contents')
        .update(contentData)
        .eq('tmdb_id', tmdbId)
        .select()

      if (error) throw error
      return data?.[0]
    } else {
      // Insert new content - cast esplicito per bypassare problemi di tipo
      const { data, error } = await (supabase as any)
        .from('contents')
        .insert(contentData)
        .select()

      if (error) throw error
      return data?.[0]
    }
  } catch (error) {
    console.error('Error saving content from TMDB:', error)
    throw error
  }
}

/**
 * Gets content by TMDB ID, fetching from TMDB if not in database
 */
export async function getContentByTMDBId(
  tmdbId: number,
  type: 'movie' | 'series' | 'anime'
): Promise<any> {
  try {
    // Try to get from database first
    const { data: content } = await supabase
      .from('contents')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .maybeSingle()

    if (content) {
      // Check if data is fresh (updated in last 7 days)
      const lastSync = new Date((content as any).last_sync_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      if (lastSync > weekAgo) {
        return content
      }
    }

    // Data is stale or doesn't exist, fetch and save from TMDB
    return await saveContentFromTMDB(tmdbId, type)
  } catch (error) {
    console.error('Error getting content:', error)
    throw error
  }
}

/**
 * Search for content and ensure it's in our database
 */
export async function searchAndCacheContent(
  query: string,
  type: 'movie' | 'series' = 'movie'
) {
  try {
    const searchResults = type === 'movie' 
      ? await tmdb.searchMovies(query)
      : await tmdb.searchSeries(query)

    // Cache first few results in our database
    const cachePromises = searchResults.results.slice(0, 5).map((item: any) =>
      saveContentFromTMDB(item.id, type === 'movie' ? 'movie' : 'series')
        .catch(err => {
          console.warn(`Failed to cache content ${item.id}:`, err)
          return null
        })
    )

    await Promise.allSettled(cachePromises)
    return searchResults
  } catch (error) {
    console.error('Error searching and caching content:', error)
    throw error
  }
}