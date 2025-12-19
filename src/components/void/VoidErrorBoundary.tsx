/**
 * VOID Error Boundary Component
 * Comprehensive error handling with graceful degradation
 */

import React, { Component, ReactNode } from 'react'
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'
import '@/styles/void-error-boundary.css'

interface VoidErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: Array<string | number>
}

interface VoidErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorCount: number
}

const MAX_ERROR_COUNT = 3

const ERROR_CODES = {
  NETWORK_OFFLINE: 'E001',
  API_ERROR: 'E003',
  AUTH_EXPIRED: 'E100',
  PERMISSION_DENIED: 'E102',
  DATA_NOT_FOUND: 'E200',
  STORAGE_FULL: 'E300',
  RENDER_ERROR: 'E401',
  UNKNOWN_ERROR: 'E999',
} as const

type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

function getErrorCode(error: Error | null): ErrorCode {
  if (!error) return ERROR_CODES.UNKNOWN_ERROR
  
  const message = error.message.toLowerCase()
  if (message.includes('network') || message.includes('fetch')) return ERROR_CODES.NETWORK_OFFLINE
  if (message.includes('api') || message.includes('http')) return ERROR_CODES.API_ERROR
  if (message.includes('auth') || message.includes('token')) return ERROR_CODES.AUTH_EXPIRED
  if (message.includes('permission') || message.includes('denied')) return ERROR_CODES.PERMISSION_DENIED
  if (message.includes('not found') || message.includes('404')) return ERROR_CODES.DATA_NOT_FOUND
  if (message.includes('quota') || message.includes('storage')) return ERROR_CODES.STORAGE_FULL
  if (message.includes('render') || message.includes('component')) return ERROR_CODES.RENDER_ERROR
  
  return ERROR_CODES.UNKNOWN_ERROR
}

export class VoidErrorBoundary extends Component<VoidErrorBoundaryProps, VoidErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null

  constructor(props: VoidErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<VoidErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.errorCode = getErrorCode(error)
    // Log error without exposing sensitive data
    const safeError = {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
    
    console.error('[VOID ErrorBoundary] Caught error:', safeError, {
      componentStack: errorInfo.componentStack,
    })

    // Call optional error handler
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo)
      } catch (handlerError) {
        console.error('[VOID ErrorBoundary] Error in error handler:', handlerError)
      }
    }

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Auto-reset after 5 seconds if error count is low
    if (this.state.errorCount < 2) {
      this.resetTimeoutId = setTimeout(() => {
        this.handleReset()
      }, 5000)
    }
  }

  componentDidUpdate(prevProps: VoidErrorBoundaryProps) {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      )
      if (hasResetKeyChanged) {
        this.handleReset()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  handleReset = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }
  
  handleCopyError = () => {
    const errorDetails = {
      code: this.errorCode,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    }
    
    const text = JSON.stringify(errorDetails, null, 2)
    navigator.clipboard.writeText(text).then(() => {
      // Show toast notification (would use notification system)
      console.log('Error details copied to clipboard')
    }).catch(console.error)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Too many errors - show permanent error
      if (this.state.errorCount >= MAX_ERROR_COUNT) {
        return (
          <div className="void-error-boundary void-error-permanent">
            <div className="void-error-content">
              <AlertTriangleIcon className="void-error-icon" />
              <h2 className="void-error-title">System Unstable</h2>
              <p className="void-error-message">
                VOID has encountered multiple errors. Please reload the application.
              </p>
              <div className="void-error-code">Error: {this.errorCode}</div>
              <div className="void-error-actions">
                <button
                  onClick={() => window.location.reload()}
                  className="void-error-button"
                >
                  <RefreshCwIcon />
                  Reload VOID
                </button>
                <button
                  onClick={this.handleCopyError}
                  className="void-error-button void-error-button-secondary"
                >
                  Copy Error Details
                </button>
              </div>
            </div>
          </div>
        )
      }

      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="void-error-boundary">
          <div className="void-error-content">
            <AlertTriangleIcon className="void-error-icon" />
            <h2 className="void-error-title">Something went wrong</h2>
            <p className="void-error-message">
              {this.state.error.message || 'An unexpected error occurred'}
            </p>
            <div className="void-error-code">Error: {this.errorCode}</div>
            <p className="void-error-safe-message">
              Your data is safe. This error has been logged.
            </p>
            <div className="void-error-actions">
              <button
                onClick={this.handleReset}
                className="void-error-button"
              >
                <RefreshCwIcon />
                Try Again
              </button>
              <button
                onClick={this.handleCopyError}
                className="void-error-button void-error-button-secondary"
              >
                Copy Error Details
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
