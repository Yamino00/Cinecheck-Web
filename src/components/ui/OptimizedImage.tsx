'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface OptimizedImageProps {
  src: string | null
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onClick?: () => void
  fallbackSrc?: string
}

// Generate blur placeholder for smooth loading
const generateBlurDataURL = (width: number, height: number): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Create gradient blur effect
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#1e293b') // slate-800
    gradient.addColorStop(0.5, '#334155') // slate-700
    gradient.addColorStop(1, '#475569') // slate-600
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL()
}

// Smart image size selector based on viewport
const getOptimalImageSize = (originalWidth: number, originalHeight: number, displayWidth: number): string => {
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const targetWidth = displayWidth * pixelRatio
  
  // TMDB available sizes: w92, w154, w185, w342, w500, w780, original
  const availableSizes = [92, 154, 185, 342, 500, 780]
  
  for (const size of availableSizes) {
    if (size >= targetWidth) {
      return `w${size}`
    }
  }
  
  return 'w780' // fallback to high quality
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onClick,
  fallbackSrc = '/images/poster-placeholder.jpg'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [optimizedSrc, setOptimizedSrc] = useState<string>('')

  useEffect(() => {
    if (!src) {
      setOptimizedSrc(fallbackSrc)
      return
    }

    // Check if it's a TMDB image and optimize it
    if (src.includes('image.tmdb.org')) {
      const optimalSize = getOptimalImageSize(width, height, width)
      const optimizedUrl = src.replace(/w\d+/, optimalSize)
      setOptimizedSrc(optimizedUrl)
    } else {
      setOptimizedSrc(src)
    }
  }, [src, width, height, fallbackSrc])

  const handleError = () => {
    setImageError(true)
    setOptimizedSrc(fallbackSrc)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // Generate blur placeholder if not provided
  const blurPlaceholder = blurDataURL || (typeof window !== 'undefined' ? generateBlurDataURL(width, height) : undefined)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 animate-pulse"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <Image
        src={optimizedSrc || fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? blurPlaceholder : undefined}
        className={`
          object-cover transition-all duration-300 
          ${isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'}
          ${onClick ? 'cursor-pointer hover:scale-105' : ''}
          ${imageError ? 'grayscale' : ''}
        `}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
        // Add WebP and AVIF support through Next.js loader
        loader={({ src, width, quality }) => {
          // For TMDB images, ensure we use the right format
          if (src.includes('image.tmdb.org')) {
            return `${src}?w=${width}&q=${quality || 75}`
          }
          return src
        }}
      />

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 text-slate-400">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-xs">Immagine non disponibile</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for responsive image dimensions
export function useResponsiveImageSize(baseWidth: number, baseHeight: number) {
  const [dimensions, setDimensions] = useState({ width: baseWidth, height: baseHeight })

  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth
      let scale = 1

      if (screenWidth < 640) { // sm
        scale = 0.8
      } else if (screenWidth < 768) { // md
        scale = 0.9
      } else if (screenWidth < 1024) { // lg
        scale = 1
      } else { // xl and above
        scale = 1.1
      }

      setDimensions({
        width: Math.round(baseWidth * scale),
        height: Math.round(baseHeight * scale)
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [baseWidth, baseHeight])

  return dimensions
}