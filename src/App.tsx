import { Outlet } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg font-sans text-ink">
        <AppHeader />
        <main className="mx-auto w-full max-w-md pt-14">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  )
}
