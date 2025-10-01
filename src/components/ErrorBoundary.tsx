'use client'

import React, { Component, ErrorInfo } from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon, BugAntIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    errorInfo: ErrorInfo
    resetError: () => void
    errorId: string
  }>
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props
    const { errorId } = this.state

    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Set error info in state
    this.setState({ errorInfo })

    // Track error in analytics
    try {
      // Import analytics dynamically to avoid dependency issues
      import('@/lib/analytics').then(({ trackErrorBoundary }) => {
        trackErrorBoundary(error, errorInfo)
      })
    } catch (analyticsError) {
      console.error('Failed to track error:', analyticsError)
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId)
    }

    // Send error to monitoring service
    this.reportError(error, errorInfo, errorId)
  }

  private async reportError(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      // Report to custom error endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId: localStorage.getItem('cinecheck_user_id'),
          sessionId: sessionStorage.getItem('cinecheck_session_id'),
        }),
      })
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    })
  }

  render() {
    const { hasError, error, errorInfo, errorId } = this.state
    const { children, fallback: Fallback } = this.props

    if (hasError && error && errorInfo) {
      if (Fallback) {
        return <Fallback error={error} errorInfo={errorInfo} resetError={this.resetError} errorId={errorId} />
      }

      return <DefaultErrorFallback error={error} errorInfo={errorInfo} resetError={this.resetError} errorId={errorId} />
    }

    return children
  }
}

// Default error fallback component
function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  errorId,
}: {
  error: Error
  errorInfo: ErrorInfo
  resetError: () => void
  errorId: string
}) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const handleReportBug = () => {
    const bugReportUrl = `https://github.com/your-repo/issues/new?title=${encodeURIComponent(
      `Bug Report: ${error.message}`
    )}&body=${encodeURIComponent(
      `**Error ID:** ${errorId}
      
**Error Message:** ${error.message}

**Stack Trace:**
\`\`\`
${error.stack}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo.componentStack}
\`\`\`

**URL:** ${window.location.href}
**User Agent:** ${navigator.userAgent}
**Timestamp:** ${new Date().toISOString()}`
    )}`

    window.open(bugReportUrl, '_blank')
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Error icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl font-bold mb-4"
        >
          Oops! Qualcosa è andato storto
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-400 mb-8 leading-relaxed"
        >
          Si è verificato un errore imprevisto. Il nostro team è stato notificato automaticamente.
        </motion.p>

        {/* Error ID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-slate-800 rounded-lg p-4 mb-8"
        >
          <p className="text-sm text-gray-300 mb-2">ID Errore:</p>
          <p className="font-mono text-sm text-amber-400 bg-slate-900 rounded px-3 py-2">
            {errorId}
          </p>
        </motion.div>

        {/* Development error details */}
        {isDevelopment && (
          <motion.details
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="bg-slate-800 rounded-lg p-4 mb-8 text-left"
          >
            <summary className="cursor-pointer text-amber-400 font-medium mb-3">
              Dettagli Errore (Solo Sviluppo)
            </summary>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-red-400 font-medium mb-2">Messaggio:</h4>
                <pre className="text-sm text-gray-300 bg-slate-900 rounded p-3 overflow-x-auto">
                  {error.message}
                </pre>
              </div>
              
              <div>
                <h4 className="text-red-400 font-medium mb-2">Stack Trace:</h4>
                <pre className="text-xs text-gray-300 bg-slate-900 rounded p-3 overflow-x-auto max-h-40">
                  {error.stack}
                </pre>
              </div>
              
              <div>
                <h4 className="text-red-400 font-medium mb-2">Component Stack:</h4>
                <pre className="text-xs text-gray-300 bg-slate-900 rounded p-3 overflow-x-auto max-h-40">
                  {errorInfo.componentStack}
                </pre>
              </div>
            </div>
          </motion.details>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={resetError}
            className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Riprova
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            Torna alla Home
          </Button>

          <Button
            onClick={handleReportBug}
            variant="outline"
            className="border-amber-600 text-amber-400 hover:bg-amber-900/20 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <BugAntIcon className="w-5 h-5" />
            Segnala Bug
          </Button>
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-8 text-xs text-gray-500"
        >
          <p>Se il problema persiste, contattaci a support@cinecheck.app</p>
        </motion.div>
      </div>
    </div>
  )
}

// Hook for catching async errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    // Trigger error boundary by throwing
    throw error
  }
}

// Higher-order component for adding error boundary to any component
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}