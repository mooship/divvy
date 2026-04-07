import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Uncaught error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
          <div className="card p-6 max-w-sm w-full text-center">
            <p className="text-lg font-bold text-ink mb-2">
              Something went wrong
            </p>
            <p className="text-sm text-muted mb-4">
              Reload the page to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary focus-ring"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
