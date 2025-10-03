import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tmdb } from '@/services/tmdb'
import SeriesHero from './components/SeriesHero'
import SeriesInfo from './components/SeriesInfo'
import SeriesMedia from './components/SeriesMedia'
import SeriesReviews from './components/SeriesReviews'
import SeriesRecommendations from './components/SeriesRecommendations'

interface SeriesPageProps {
  params: {
    id: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  try {
    const seriesId = parseInt(params.id)
    if (isNaN(seriesId)) return { title: 'Serie non trovata' }

    const series = await tmdb.getSeriesComplete(seriesId)
    
    const firstYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : ''
    const lastYear = series.last_air_date ? new Date(series.last_air_date).getFullYear() : 'Present'
    const yearRange = firstYear && lastYear !== firstYear ? `${firstYear}-${lastYear}` : firstYear
    
    return {
      title: `${series.name} (${yearRange}) - Cinecheck`,
      description: series.overview || `Guarda ${series.name} su Cinecheck`,
      openGraph: {
        title: series.name,
        description: series.overview,
        images: [
          {
            url: tmdb.getBackdropUrl(series.backdrop_path, 'original'),
            width: 1920,
            height: 1080,
            alt: series.name,
          },
        ],
        type: 'video.tv_show',
      },
      twitter: {
        card: 'summary_large_image',
        title: series.name,
        description: series.overview,
        images: [tmdb.getBackdropUrl(series.backdrop_path, 'original')],
      },
    }
  } catch (error) {
    return { title: 'Serie non trovata' }
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const seriesId = parseInt(params.id)
  
  if (isNaN(seriesId)) {
    notFound()
  }

  try {
    const series = await tmdb.getSeriesComplete(seriesId)

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <SeriesHero series={series} />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 space-y-12">
          {/* Info Section */}
          <SeriesInfo series={series} />

          {/* Media Section */}
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <SeriesMedia series={series} />
          </Suspense>

          {/* Reviews Section */}
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <SeriesReviews seriesId={seriesId} seriesTitle={series.name} />
          </Suspense>

          {/* Recommendations Section */}
          {series.similar?.results && series.similar.results.length > 0 && (
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
              <SeriesRecommendations series={series.similar.results} />
            </Suspense>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading series:', error)
    notFound()
  }
}
