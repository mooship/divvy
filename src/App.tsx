import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg font-sans text-ink">
        <Outlet />
      </div>
    </ErrorBoundary>
  )
}
