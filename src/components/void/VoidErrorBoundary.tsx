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

  render() {
    if (this.state.hasError && this.state.error) {
      // Too many errors - show permanent error
      if (this.state.errorCount >= MAX_ERROR_COUNT) {
        return (
          <div className="void-error-boundary void-error-permanent">
            <div className="void-error-content">
              <AlertTriangleIcon className="void-error-icon" />
              <h2 className="void-error-title">VOID Component Error</h2>
              <p className="void-error-message">
                This component encountered multiple errors. Please refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="void-error-button"
              >
                <RefreshCwIcon />
                Refresh Page
              </button>
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
              {process.env.NODE_ENV === 'development'
                ? this.state.error.message
                : 'An error occurred in this component. It will attempt to recover automatically.'}
            </p>
            <button
              onClick={this.handleReset}
              className="void-error-button"
            >
              <RefreshCwIcon />
              Try Again
            </button>
            {this.state.errorCount > 0 && (
              <p className="void-error-count">
                Recovery attempt {this.state.errorCount} of {MAX_ERROR_COUNT}
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
