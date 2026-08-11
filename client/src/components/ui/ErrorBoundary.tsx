import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Uncaught error:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-4xl">🕯️</div>
          <h2 className="mb-2 font-serif-display text-2xl text-[rgb(var(--ink))]">Something went wrong</h2>
          <p className="mb-6 max-w-sm text-sm text-[rgb(var(--ink-soft))]">
            An unexpected error occurred. Your entries are safe.
          </p>
          <button
            onClick={this.handleReset}
            className="rounded-full bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
