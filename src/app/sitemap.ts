import { MetadataRoute } from 'next'
import { tmdb } from '@/services/tmdb'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cinecheck.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  try {
    // Get popular movies for sitemap
    const popularMovies = await tmdb.getPopularMovies(1)
    const moviePages: MetadataRoute.Sitemap = popularMovies.results.slice(0, 50).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // Get popular series for sitemap
    const popularSeries = await tmdb.getPopularSeries(1)
    const seriesPages: MetadataRoute.Sitemap = popularSeries.results.slice(0, 50).map((series) => ({
      url: `${BASE_URL}/series/${series.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticPages, ...moviePages, ...seriesPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}