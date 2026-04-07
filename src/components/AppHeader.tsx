import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface AppHeaderProps {
  backTo?: string
  step?: number
  totalSteps?: number
}

export function AppHeader({ backTo, step, totalSteps = 4 }: AppHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-bg border-b border-surface flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-14 flex items-center px-4">
        <div className="mx-auto w-full max-w-md flex items-center">
          {backTo && (
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="min-w-11 min-h-11 flex items-center justify-center -ml-2 mr-1 focus-ring rounded-lg"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 text-ink" aria-hidden="true" />
            </button>
          )}
          <Link
            to="/"
            className="text-xl font-bold text-coral focus-ring rounded px-1"
          >
            Divvy
          </Link>
        </div>
      </div>
      {step != null && (
        <nav
          className="mx-auto w-full max-w-md px-4 pb-2 flex gap-1.5"
          aria-label={`Step ${step} of ${totalSteps}`}
        >
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static step indicators never reorder
              key={i}
              className={`h-1 flex-1 rounded-full ${i < step ? 'bg-coral' : 'bg-surface'}`}
            />
          ))}
        </nav>
      )}
    </header>
  )
}
