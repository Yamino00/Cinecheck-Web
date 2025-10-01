import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMITS = {
  // API routes
  '/api/auth': { requests: 5, window: 60000 }, // 5 requests per minute
  '/api/reviews': { requests: 10, window: 60000 }, // 10 requests per minute
  '/api/search': { requests: 30, window: 60000 }, // 30 requests per minute
  '/api/quiz': { requests: 20, window: 60000 }, // 20 requests per minute
  
  // General API rate limit
  '/api': { requests: 100, window: 60000 }, // 100 requests per minute
}

// Store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Content Security Policy
const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https://image.tmdb.org https://i.ytimg.com https://img.youtube.com https://*.supabase.co;
  media-src 'self' data: blob:;
  connect-src 'self' https://api.themoviedb.org https://*.supabase.co wss://*.supabase.co https://vercel.live;
  frame-src 'self' https://www.youtube.com https://player.vimeo.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim()

export function securityMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip ?? 'anonymous'
  const userAgent = request.headers.get('user-agent') ?? ''

  // Security headers
  const response = NextResponse.next()
  
  // CSP Header
  response.headers.set('Content-Security-Policy', CSP_HEADER)
  
  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = checkRateLimit(pathname, ip)
    
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
  }

  // Bot detection and blocking
  if (isSuspiciousBot(userAgent, pathname)) {
    return new NextResponse('Access denied', { status: 403 })
  }

  // Request size limiting
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return new NextResponse('Request too large', { status: 413 })
  }

  return response
}

function checkRateLimit(pathname: string, ip: string): {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter: number
} {
  // Find matching rate limit config
  let rateLimit = RATE_LIMITS['/api'] // default
  
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path) && path !== '/api') {
      rateLimit = limit
      break
    }
  }

  const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}`
  const now = Date.now()
  const stored = rateLimitStore.get(key)

  // Initialize or reset if window has passed
  if (!stored || now > stored.resetTime) {
    const resetTime = now + rateLimit.window
    rateLimitStore.set(key, { count: 1, resetTime })
    
    return {
      allowed: true,
      limit: rateLimit.requests,
      remaining: rateLimit.requests - 1,
      resetTime,
      retryAfter: 0
    }
  }

  // Check if limit exceeded
  if (stored.count >= rateLimit.requests) {
    return {
      allowed: false,
      limit: rateLimit.requests,
      remaining: 0,
      resetTime: stored.resetTime,
      retryAfter: Math.ceil((stored.resetTime - now) / 1000)
    }
  }

  // Increment counter
  stored.count++
  rateLimitStore.set(key, stored)

  return {
    allowed: true,
    limit: rateLimit.requests,
    remaining: rateLimit.requests - stored.count,
    resetTime: stored.resetTime,
    retryAfter: 0
  }
}

function isSuspiciousBot(userAgent: string, pathname: string): boolean {
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /python-requests/i,
    /scrapy/i,
    /crawler/i,
    /spider/i,
    /bot.*bot/i,
    /automated/i,
    /^$/,
  ]

  // Allow legitimate bots for SEO
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i,
  ]

  // Check if it's a legitimate bot first
  for (const pattern of legitimateBots) {
    if (pattern.test(userAgent)) {
      return false
    }
  }

  // Check for suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      return true
    }
  }

  // Block rapid requests to sensitive endpoints
  if (pathname.startsWith('/api/auth') && userAgent.length < 10) {
    return true
  }

  return false
}

// Input sanitization utilities
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove HTML/script chars
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = email.trim().toLowerCase()
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

export function sanitizeUsername(username: string): string {
  if (typeof username !== 'string') return ''
  
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '') // Only alphanumeric and underscore
    .substring(0, 30) // Max 30 chars
}

// SQL injection prevention (for raw queries)
export function escapeSQLString(str: string): string {
  if (typeof str !== 'string') return ''
  
  return str.replace(/'/g, "''")
}

// XSS prevention for user-generated content
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return ''
  
  // Basic HTML sanitization - in production use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
}

// Validate API request structure
export function validateAPIRequest(request: any, schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Basic validation - in production use a schema validation library like Zod
  for (const [key, rules] of Object.entries(schema)) {
    const value = request[key]
    const ruleSet = rules as any
    
    if (ruleSet.required && (value === undefined || value === null)) {
      errors.push(`${key} is required`)
      continue
    }
    
    if (value !== undefined && value !== null) {
      if (ruleSet.type && typeof value !== ruleSet.type) {
        errors.push(`${key} must be of type ${ruleSet.type}`)
      }
      
      if (ruleSet.minLength && value.length < ruleSet.minLength) {
        errors.push(`${key} must be at least ${ruleSet.minLength} characters`)
      }
      
      if (ruleSet.maxLength && value.length > ruleSet.maxLength) {
        errors.push(`${key} must be no more than ${ruleSet.maxLength} characters`)
      }
      
      if (ruleSet.pattern && !ruleSet.pattern.test(value)) {
        errors.push(`${key} format is invalid`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Clean expired rate limit entries (call periodically)
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60000) // Cleanup every minute
}