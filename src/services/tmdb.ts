import axios from 'axios'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.EXPO_PUBLIC_TMDB_API_KEY || ''
const TMDB_READ_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN || process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN || ''
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export interface TMDBMovie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime: number
  genres: Array<{ id: number; name: string }>
  vote_average: number
  vote_count: number
  popularity: number
  budget: number
  revenue: number
  status: string
  tagline: string
  production_companies: Array<{
    id: number
    name: string
    logo_path: string | null
    origin_country: string
  }>
  videos?: {
    results: Array<{
      id: string
      key: string
      name: string
      site: string
      type: string
    }>
  }
  credits?: {
    cast: Array<{
      id: number
      name: string
      character: string
      profile_path: string | null
      order: number
    }>
    crew: Array<{
      id: number
      name: string
      job: string
      department: string
      profile_path: string | null
    }>
  }
}

export interface TMDBSeries {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  last_air_date: string
  number_of_seasons: number
  number_of_episodes: number
  genres: Array<{ id: number; name: string }>
  vote_average: number
  vote_count: number
  popularity: number
  status: string
  type: string
  networks: Array<{
    id: number
    name: string
    logo_path: string | null
  }>
  seasons: Array<{
    id: number
    season_number: number
    episode_count: number
    name: string
    overview: string
    poster_path: string | null
    air_date: string
  }>
}

class TMDBService {
  private apiKey: string
  private readAccessToken: string
  private baseUrl: string
  private imageBaseUrl: string
  private language: string = 'it-IT'
  private useBearer: boolean = true // Use Bearer token by default

  constructor() {
    this.apiKey = TMDB_API_KEY
    this.readAccessToken = TMDB_READ_ACCESS_TOKEN
    this.baseUrl = TMDB_BASE_URL
    this.imageBaseUrl = TMDB_IMAGE_BASE_URL
  }

  // Helper to get axios config with auth
  private getAxiosConfig(params?: any) {
    if (this.useBearer && this.readAccessToken) {
      return {
        headers: {
          'Authorization': `Bearer ${this.readAccessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          language: this.language,
          ...params,
        },
      }
    } else {
      return {
        params: {
          api_key: this.apiKey,
          language: this.language,
          ...params,
        },
      }
    }
  }

  // Image URL helpers
  getPosterUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342'): string {
    if (!path) return '/placeholder-poster.jpg'
    return `${this.imageBaseUrl}/${size}${path}`
  }

  getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg'
    return `${this.imageBaseUrl}/${size}${path}`
  }

  getProfileUrl(path: string | null, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'): string {
    if (!path) return '/placeholder-profile.jpg'
    return `${this.imageBaseUrl}/${size}${path}`
  }

  // Movies
  async getMovie(movieId: number): Promise<TMDBMovie> {
    const config = this.getAxiosConfig({
      append_to_response: 'videos,credits,keywords',
    })
    const { data } = await axios.get(`${this.baseUrl}/movie/${movieId}`, config)
    return data
  }

  async getPopularMovies(page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const config = this.getAxiosConfig({ page, region: 'IT' })
    const { data } = await axios.get(`${this.baseUrl}/movie/popular`, config)
    return data
  }

  async getTopRatedMovies(page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const config = this.getAxiosConfig({ page, region: 'IT' })
    const { data } = await axios.get(`${this.baseUrl}/movie/top_rated`, config)
    return data
  }

  async getNowPlayingMovies(page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const config = this.getAxiosConfig({ page, region: 'IT' })
    const { data } = await axios.get(`${this.baseUrl}/movie/now_playing`, config)
    return data
  }

  async getUpcomingMovies(page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const config = this.getAxiosConfig({ page, region: 'IT' })
    const { data } = await axios.get(`${this.baseUrl}/movie/upcoming`, config)
    return data
  }

  async getSimilarMovies(movieId: number): Promise<{ results: TMDBMovie[] }> {
    const config = this.getAxiosConfig()
    const { data } = await axios.get(`${this.baseUrl}/movie/${movieId}/similar`, config)
    return data
  }

  // TV Series
  async getSeries(seriesId: number): Promise<TMDBSeries> {
    const config = this.getAxiosConfig({
      append_to_response: 'videos,credits,keywords',
    })
    const { data } = await axios.get(`${this.baseUrl}/tv/${seriesId}`, config)
    return data
  }

  async getPopularSeries(page: number = 1): Promise<{ results: TMDBSeries[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/tv/popular`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        page,
      },
    })
    return data
  }

  async getTopRatedSeries(page: number = 1): Promise<{ results: TMDBSeries[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/tv/top_rated`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        page,
      },
    })
    return data
  }

  async getOnTheAirSeries(page: number = 1): Promise<{ results: TMDBSeries[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/tv/on_the_air`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        page,
      },
    })
    return data
  }

  // Anime (using genre filter)
  async getPopularAnime(page: number = 1): Promise<{ results: TMDBSeries[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/discover/tv`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        page,
        with_genres: '16', // Animation genre
        with_origin_country: 'JP', // Japan
        sort_by: 'popularity.desc',
      },
    })
    return data
  }

  async getTopRatedAnime(page: number = 1): Promise<{ results: TMDBSeries[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/discover/tv`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        page,
        with_genres: '16', // Animation genre
        with_origin_country: 'JP', // Japan
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
      },
    })
    return data
  }

  // Search
  async searchMulti(query: string, page: number = 1): Promise<{ results: any[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/search/multi`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        query,
        page,
        include_adult: false,
      },
    })
    return data
  }

  async searchMovies(query: string, page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/search/movie`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        query,
        page,
        include_adult: false,
      },
    })
    return data
  }

  async searchSeries(query: string, page: number = 1): Promise<{ results: TMDBSeries[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/search/tv`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        query,
        page,
        include_adult: false,
      },
    })
    return data
  }

  // Discover
  async discover(params: {
    type: 'movie' | 'tv'
    genres?: string
    year?: number
    sortBy?: string
    page?: number
  }): Promise<{ results: any[]; total_pages: number }> {
    const { data } = await axios.get(`${this.baseUrl}/discover/${params.type}`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
        page: params.page || 1,
        sort_by: params.sortBy || 'popularity.desc',
        with_genres: params.genres,
        year: params.year,
        include_adult: false,
      },
    })
    return data
  }

  // Genres
  async getMovieGenres(): Promise<Array<{ id: number; name: string }>> {
    const { data } = await axios.get(`${this.baseUrl}/genre/movie/list`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
      },
    })
    return data.genres
  }

  async getTVGenres(): Promise<Array<{ id: number; name: string }>> {
    const { data } = await axios.get(`${this.baseUrl}/genre/tv/list`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
      },
    })
    return data.genres
  }

  // Trending
  async getTrending(
    mediaType: 'all' | 'movie' | 'tv' = 'all',
    timeWindow: 'day' | 'week' = 'week'
  ): Promise<{ results: any[]; total_pages: number }> {
    const config = this.getAxiosConfig()
    const { data } = await axios.get(`${this.baseUrl}/trending/${mediaType}/${timeWindow}`, config)
    return data
  }

  // Get videos/trailers for a movie or series
  async getVideos(mediaType: 'movie' | 'tv', id: number): Promise<any[]> {
    const { data } = await axios.get(`${this.baseUrl}/${mediaType}/${id}/videos`, {
      params: {
        api_key: this.apiKey,
        language: this.language,
      },
    })
    
    // Fallback to English if no Italian videos
    if (data.results.length === 0) {
      const { data: enData } = await axios.get(`${this.baseUrl}/${mediaType}/${id}/videos`, {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
        },
      })
      return enData.results
    }
    
    return data.results
  }

  // Get YouTube trailer URL
  getYouTubeUrl(key: string): string {
    return `https://www.youtube.com/watch?v=${key}`
  }

  getYouTubeEmbedUrl(key: string): string {
    return `https://www.youtube.com/embed/${key}`
  }
}

export const tmdb = new TMDBService()
export default tmdb