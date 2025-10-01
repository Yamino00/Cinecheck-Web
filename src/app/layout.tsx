import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Cinecheck - Recensioni Cinematografiche Verificate',
  description: 'La piattaforma sociale rivoluzionaria per recensioni cinematografiche autentiche con sistema di verifica tramite quiz.',
  keywords: 'film, recensioni, cinema, serie tv, anime, quiz, verificate, autentiche',
  authors: [{ name: 'Cinecheck Team' }],
  openGraph: {
    title: 'Cinecheck - Recensioni Cinematografiche Verificate',
    description: 'La piattaforma sociale rivoluzionaria per recensioni cinematografiche autentiche',
    url: 'https://cinecheck.app',
    siteName: 'Cinecheck',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cinecheck - Recensioni Cinematografiche Verificate',
    description: 'La piattaforma sociale rivoluzionaria per recensioni cinematografiche autentiche',
    images: ['/twitter-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={inter.variable}>
      <body className="font-sans antialiased">
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}