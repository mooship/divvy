import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-bg border-b border-surface flex items-center px-4">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="text-xl font-bold text-coral focus-ring rounded px-1"
        >
          Divvy
        </Link>
      </div>
    </header>
  )
}
