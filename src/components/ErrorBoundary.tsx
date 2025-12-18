import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from '@phosphor-icons/react'
import { performanceMonitor } from '@/lib/performance'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Enhanced Error Boundary with performance monitoring
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Record error in performance monitor
    performanceMonitor.recordMetric('error-boundary', 1)
    
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
          <Card className="max-w-md w-full border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle size={32} className="text-[#FF0000]" weight="bold" />
                <div>
                  <CardTitle className="text-black dark:text-white">
                    Something went wrong
                  </CardTitle>
                  <CardDescription className="text-black/70 dark:text-white/70">
                    An unexpected error occurred
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded border-0 shadow-sm">
                  <p className="text-sm font-mono text-black/80 dark:text-white/80 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 border-0 shadow-lg hover:shadow-xl"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 border-0 shadow-lg hover:shadow-xl"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
