import { Metadata } from 'next'
import { tmdb } from '@/services/tmdb'

// Base configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cinecheck.vercel.app'
const SITE_NAME = 'Cinecheck'
const DEFAULT_DESCRIPTION = 'La piattaforma sociale rivoluzionaria per recensioni cinematografiche autentiche con sistema di verifica tramite quiz.'

// Default metadata
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} - Recensioni Cinematografiche Verificate`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'film',
    'recensioni',
    'cinema',
    'serie tv',
    'anime',
    'quiz',
    'verificate',
    'autentiche',
    'TMDB',
    'social network',
    'cinefili'
  ],
  authors: [{ name: 'Cinecheck Team' }],
  creator: 'Cinecheck Team',
  publisher: 'Cinecheck',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Recensioni Cinematografiche Verificate`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Recensioni Cinematografiche Verificate`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Recensioni Cinematografiche Verificate`,
    description: DEFAULT_DESCRIPTION,
    images: ['/twitter-image.jpg'],
    creator: '@cinecheck',
    site: '@cinecheck',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: BASE_URL,
    languages: {
      'it-IT': BASE_URL,
      'en-US': `${BASE_URL}/en`,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
}

// Generate metadata for movie pages
export async function generateMovieMetadata(movieId: number): Promise<Metadata> {
  try {
    const movie = await tmdb.getMovie(movieId)
    const posterUrl = movie.poster_path 
      ? tmdb.getPosterUrl(movie.poster_path, 'w500')
      : '/og-image.jpg'
    
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : ''
    const title = `${movie.title}${year ? ` (${year})` : ''}`
    const description = movie.overview 
      ? `${movie.overview.substring(0, 160)}...`
      : `Scopri tutto su ${movie.title} - recensioni verificate, trailer, cast e molto altro su ${SITE_NAME}.`

    // Generate structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Movie',
      name: movie.title,
      image: posterUrl,
      description: movie.overview,
      datePublished: movie.release_date,
      genre: movie.genres?.map(g => g.name) || [],
      aggregateRating: movie.vote_average ? {
        '@type': 'AggregateRating',
        ratingValue: movie.vote_average,
        ratingCount: movie.vote_count,
        bestRating: 10,
        worstRating: 1,
      } : undefined,
      duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
      director: movie.credits?.crew?.find(c => c.job === 'Director')?.name,
      actor: movie.credits?.cast?.slice(0, 5).map(actor => ({
        '@type': 'Person',
        name: actor.name,
      })) || [],
      productionCompany: movie.production_companies?.map(company => ({
        '@type': 'Organization',
        name: company.name,
      })) || [],
    }

    return {
      title,
      description,
      keywords: [
        movie.title,
        'film',
        'recensioni',
        'trailer',
        'cast',
        ...(movie.genres?.map(g => g.name.toLowerCase()) || []),
        ...(movie.credits?.cast?.slice(0, 5).map(actor => actor.name) || []),
      ],
      openGraph: {
        type: 'video.movie',
        title,
        description,
        url: `${BASE_URL}/movie/${movieId}`,
        images: [
          {
            url: posterUrl,
            width: 500,
            height: 750,
            alt: movie.title,
          },
        ],
        releaseDate: movie.release_date,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [posterUrl],
      },
      alternates: {
        canonical: `${BASE_URL}/movie/${movieId}`,
      },
      other: {
        'application/ld+json': JSON.stringify(structuredData),
      },
    }
  } catch (error) {
    console.error('Error generating movie metadata:', error)
    return {
      title: 'Film non trovato',
      description: 'Il film richiesto non è stato trovato.',
    }
  }
}

// Generate metadata for series pages
export async function generateSeriesMetadata(seriesId: number): Promise<Metadata> {
  try {
    const series = await tmdb.getSeries(seriesId)
    const posterUrl = series.poster_path 
      ? tmdb.getPosterUrl(series.poster_path, 'w500')
      : '/og-image.jpg'
    
    const year = series.first_air_date ? new Date(series.first_air_date).getFullYear() : ''
    const title = `${series.name}${year ? ` (${year})` : ''}`
    const description = series.overview 
      ? `${series.overview.substring(0, 160)}...`
      : `Scopri tutto su ${series.name} - recensioni verificate, trailer, cast e molto altro su ${SITE_NAME}.`

    // Generate structured data for TV Series
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'TVSeries',
      name: series.name,
      image: posterUrl,
      description: series.overview,
      datePublished: series.first_air_date,
      genre: series.genres?.map(g => g.name) || [],
      numberOfSeasons: series.number_of_seasons,
      numberOfEpisodes: series.number_of_episodes,
      aggregateRating: series.vote_average ? {
        '@type': 'AggregateRating',
        ratingValue: series.vote_average,
        ratingCount: series.vote_count,
        bestRating: 10,
        worstRating: 1,
      } : undefined,
      actor: series.credits?.cast?.slice(0, 5).map((actor: any) => ({
        '@type': 'Person',
        name: actor.name,
      })) || [],
      productionCompany: series.production_companies?.map((company: any) => ({
        '@type': 'Organization',
        name: company.name,
      })) || [],
    }

    return {
      title,
      description,
      keywords: [
        series.name,
        'serie tv',
        'recensioni',
        'episodi',
        'stagioni',
        ...(series.genres?.map(g => g.name.toLowerCase()) || []),
        ...(series.credits?.cast?.slice(0, 5).map((actor: any) => actor.name) || []),
      ],
      openGraph: {
        type: 'video.tv_show',
        title,
        description,
        url: `${BASE_URL}/series/${seriesId}`,
        images: [
          {
            url: posterUrl,
            width: 500,
            height: 750,
            alt: series.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [posterUrl],
      },
      alternates: {
        canonical: `${BASE_URL}/series/${seriesId}`,
      },
      other: {
        'application/ld+json': JSON.stringify(structuredData),
      },
    }
  } catch (error) {
    console.error('Error generating series metadata:', error)
    return {
      title: 'Serie TV non trovata',
      description: 'La serie TV richiesta non è stata trovata.',
    }
  }
}

// Generate metadata for user profiles
export function generateProfileMetadata(username: string, displayName: string, bio?: string): Metadata {
  const title = `${displayName} (@${username})`
  const description = bio 
    ? `${bio.substring(0, 160)}...`
    : `Profilo di ${displayName} su ${SITE_NAME} - Scopri le sue recensioni cinematografiche verificate.`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: displayName,
    alternateName: username,
    description: bio,
    url: `${BASE_URL}/profile/${username}`,
  }

  return {
    title,
    description,
    keywords: [username, displayName, 'profilo', 'recensioni', 'cinefilo'],
    openGraph: {
      type: 'profile',
      title,
      description,
      url: `${BASE_URL}/profile/${username}`,
      username,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/profile/${username}`,
    },
    other: {
      'application/ld+json': JSON.stringify(structuredData),
    },
  }
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Generate FAQ structured data for common questions
export function generateFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Come funziona il sistema di verifica delle recensioni?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Su Cinecheck, per lasciare una recensione verificata devi prima superare un quiz sul contenuto che vuoi recensire. Questo garantisce che tu abbia effettivamente visto il film o la serie TV.',
        },
      },
      {
        '@type': 'Question',
        name: 'Cos\'è il punteggio di affidabilità?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Il punteggio di affidabilità è calcolato in base al tuo successo nei quiz e alla qualità delle tue recensioni. Un punteggio più alto indica un recensore più affidabile.',
        },
      },
      {
        '@type': 'Question',
        name: 'Posso recensire senza fare il quiz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puoi lasciare un commento, ma solo le recensioni di utenti che hanno superato il quiz vengono marcate come "verificate" e contribuiscono al punteggio finale del contenuto.',
        },
      },
    ],
  }
}