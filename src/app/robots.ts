import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cinecheck.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/movie/*',
          '/series/*',
          '/anime/*',
          '/profile/*',
        ],
        disallow: [
          '/auth',
          '/api/*',
          '/admin/*',
          '/_next/*',
          '/private/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/movie/*',
          '/series/*',
          '/anime/*',
        ],
        disallow: [
          '/auth',
          '/profile/*', // Privacy: non indicizzare profili utente
          '/api/*',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}