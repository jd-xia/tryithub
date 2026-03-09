import { Component, type ErrorInfo, type ReactNode } from 'react'

// Error boundaries must be class components (React doesn't support them as hooks yet).

interface Props {
  children: ReactNode  // ReactNode = anything React can render (JSX, string, number, etc.)
}

interface State {
  hasError: boolean
  error: Error | null
}

// Component<Props, State>: generic type params for this component's props and state.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  // Static lifecycle: when a child throws, React calls this. Return new state to show fallback UI.
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  // Lifecycle: run side effects when an error is caught (e.g. log to service). componentStack = where in the tree it broke.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Inline style: object with camelCase CSS properties. Double curly = JS expression that returns an object.
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '600px',
          margin: '2rem auto',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '12px',
          color: '#fecaca',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Something went wrong</h2>
          <pre style={{
            margin: 0,
            fontSize: '0.85rem',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {this.state.error.message}
          </pre>
          <p style={{ margin: '1rem 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            Check the browser console (F12) for details.
          </p>
        </div>
      )
    }
    return this.props.children  // No error: render children as usual
  }
}
