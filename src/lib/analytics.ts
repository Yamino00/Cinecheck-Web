'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Global gtag declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'consent',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

// Analytics configuration
const ANALYTICS_CONFIG = {
  // Google Analytics
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  
  // Custom analytics endpoint
  ANALYTICS_ENDPOINT: '/api/analytics',
  
  // Enable debugging in development
  DEBUG: process.env.NODE_ENV === 'development',
}

// Event types for tracking
export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  customProperties?: Record<string, any>
}

// User session tracking
interface UserSession {
  sessionId: string
  userId?: string
  startTime: number
  lastActivity: number
  pageViews: number
  events: AnalyticsEvent[]
}

class AnalyticsService {
  private session: UserSession | null = null
  private queue: AnalyticsEvent[] = []
  private isOnline = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSession()
      this.setupOnlineOfflineHandlers()
      this.setupBeforeUnloadHandler()
    }
  }

  private initializeSession() {
    const sessionId = this.getOrCreateSessionId()
    const userId = this.getUserId()
    
    this.session = {
      sessionId,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: []
    }

    if (ANALYTICS_CONFIG.DEBUG) {
      console.log('[Analytics] Session initialized:', this.session)
    }
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('cinecheck_session_id')
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('cinecheck_session_id', sessionId)
    }
    
    return sessionId
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('cinecheck_user_id') || undefined
  }

  private setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private setupBeforeUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.session) return

    this.session.pageViews++
    this.session.lastActivity = Date.now()

    const event: AnalyticsEvent = {
      action: 'page_view',
      category: 'navigation',
      label: path,
      customProperties: {
        title,
        sessionId: this.session.sessionId,
        userId: this.session.userId,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
      }
    }

    this.trackEvent(event)

    // Track with Google Analytics if available
    if (typeof window.gtag !== 'undefined' && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
      window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title,
      })
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.session) return

    const enrichedEvent = {
      ...event,
      sessionId: this.session.sessionId,
      userId: this.session.userId,
      timestamp: Date.now(),
      ...event.customProperties
    }

    this.session.events.push(event)
    this.session.lastActivity = Date.now()

    if (ANALYTICS_CONFIG.DEBUG) {
      console.log('[Analytics] Event tracked:', enrichedEvent)
    }

    // Add to queue
    this.queue.push(enrichedEvent)

    // Track with Google Analytics if available
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_map: event.customProperties
      })
    }

    // Send immediately if online, otherwise queue
    if (this.isOnline) {
      this.flushQueue()
    }
  }

  // Track user interactions
  trackClick(element: string, location: string) {
    this.trackEvent({
      action: 'click',
      category: 'interaction',
      label: element,
      customProperties: { location }
    })
  }

  trackMovieView(movieId: number, title: string) {
    this.trackEvent({
      action: 'movie_view',
      category: 'content',
      label: title,
      value: movieId,
      customProperties: { movieId, contentType: 'movie' }
    })
  }

  trackSeriesView(seriesId: number, title: string) {
    this.trackEvent({
      action: 'series_view',
      category: 'content',
      label: title,
      value: seriesId,
      customProperties: { seriesId, contentType: 'series' }
    })
  }

  trackSearch(query: string, resultsCount: number) {
    this.trackEvent({
      action: 'search',
      category: 'engagement',
      label: query,
      value: resultsCount,
      customProperties: { query, resultsCount }
    })
  }

  trackReviewSubmission(contentId: string, rating: number, isVerified: boolean) {
    this.trackEvent({
      action: 'review_submit',
      category: 'engagement',
      label: contentId,
      value: rating,
      customProperties: { contentId, rating, isVerified }
    })
  }

  trackQuizCompletion(contentId: string, score: number, timeSpent: number) {
    this.trackEvent({
      action: 'quiz_complete',
      category: 'engagement',
      label: contentId,
      value: score,
      customProperties: { contentId, score, timeSpent }
    })
  }

  trackError(error: Error, context?: string) {
    this.trackEvent({
      action: 'error',
      category: 'technical',
      label: error.message,
      customProperties: {
        errorName: error.name,
        errorStack: error.stack,
        context,
        url: window.location.href
      }
    })
  }

  trackPerformance(metric: string, value: number, unit = 'ms') {
    this.trackEvent({
      action: 'performance',
      category: 'technical',
      label: metric,
      value,
      customProperties: { metric, unit }
    })
  }

  // Send queued events to server
  private async flushQueue() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      const response = await fetch(ANALYTICS_CONFIG.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events })
      })

      if (!response.ok) {
        // Re-queue events if failed
        this.queue.unshift(...events)
        throw new Error(`Analytics request failed: ${response.status}`)
      }

      if (ANALYTICS_CONFIG.DEBUG) {
        console.log('[Analytics] Events sent successfully:', events.length)
      }
    } catch (error) {
      // Re-queue events for retry
      this.queue.unshift(...events)
      
      if (ANALYTICS_CONFIG.DEBUG) {
        console.error('[Analytics] Failed to send events:', error)
      }
    }
  }

  // Set user ID when user logs in
  setUserId(userId: string) {
    if (this.session) {
      this.session.userId = userId
    }
    localStorage.setItem('cinecheck_user_id', userId)

    // Track login event
    this.trackEvent({
      action: 'login',
      category: 'auth',
      customProperties: { userId }
    })
  }

  // Clear user ID when user logs out
  clearUserId() {
    if (this.session) {
      this.session.userId = undefined
    }
    localStorage.removeItem('cinecheck_user_id')

    // Track logout event
    this.trackEvent({
      action: 'logout',
      category: 'auth'
    })
  }

  // End session
  private endSession() {
    if (!this.session) return

    const sessionDuration = Date.now() - this.session.startTime

    this.trackEvent({
      action: 'session_end',
      category: 'engagement',
      value: sessionDuration,
      customProperties: {
        sessionDuration,
        pageViews: this.session.pageViews,
        eventsCount: this.session.events.length
      }
    })

    // Force send remaining events
    if (this.queue.length > 0) {
      navigator.sendBeacon(
        ANALYTICS_CONFIG.ANALYTICS_ENDPOINT,
        JSON.stringify({ events: this.queue })
      )
    }
  }

  // Get session analytics
  getSessionAnalytics() {
    return this.session ? {
      sessionId: this.session.sessionId,
      duration: Date.now() - this.session.startTime,
      pageViews: this.session.pageViews,
      eventsCount: this.session.events.length,
      lastActivity: this.session.lastActivity
    } : null
  }
}

// Global analytics instance
export const analytics = new AnalyticsService()

// React hook for analytics
export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page view
    const path = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    analytics.trackPageView(path, document.title)
  }, [pathname, searchParams])

  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackClick: analytics.trackClick.bind(analytics),
    trackMovieView: analytics.trackMovieView.bind(analytics),
    trackSeriesView: analytics.trackSeriesView.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackReviewSubmission: analytics.trackReviewSubmission.bind(analytics),
    trackQuizCompletion: analytics.trackQuizCompletion.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    clearUserId: analytics.clearUserId.bind(analytics),
    getSessionAnalytics: analytics.getSessionAnalytics.bind(analytics),
  }
}

// Performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Core Web Vitals
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS((metric) => analytics.trackPerformance('CLS', metric.value))
    onINP((metric) => analytics.trackPerformance('INP', metric.value))
    onFCP((metric) => analytics.trackPerformance('FCP', metric.value))
    onLCP((metric) => analytics.trackPerformance('LCP', metric.value))
    onTTFB((metric) => analytics.trackPerformance('TTFB', metric.value))
  }).catch((error) => {
    if (ANALYTICS_CONFIG.DEBUG) {
      console.warn('Web Vitals not available:', error)
    }
  })

  // Navigation timing
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      analytics.trackPerformance('DOM_Load', navigation.domContentLoadedEventEnd - navigation.fetchStart)
      analytics.trackPerformance('Page_Load', navigation.loadEventEnd - navigation.fetchStart)
      analytics.trackPerformance('DNS_Lookup', navigation.domainLookupEnd - navigation.domainLookupStart)
      analytics.trackPerformance('TCP_Connect', navigation.connectEnd - navigation.connectStart)
      analytics.trackPerformance('Server_Response', navigation.responseEnd - navigation.requestStart)
    }
  })

  // Resource timing for large resources
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const resourceEntry = entry as PerformanceResourceTiming
      if (resourceEntry.transferSize && resourceEntry.transferSize > 100000) { // Track resources > 100KB
        analytics.trackPerformance(`Resource_Load_${entry.name.split('/').pop()}`, entry.duration)
      }
    })
  })
  
  observer.observe({ entryTypes: ['resource'] })
}

// Error boundary integration
export function trackErrorBoundary(error: Error, errorInfo: any) {
  analytics.trackError(error, `Error Boundary: ${errorInfo.componentStack}`)
}