import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { useBillStore } from '../../store'

export function Home() {
  const navigate = useNavigate()
  const billId = useBillStore((s) => s.id)
  const reset = useBillStore((s) => s.reset)

  const handleStart = () => {
    reset()
    navigate('/setup')
  }

  const handleContinue = () => {
    navigate('/items')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 gap-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-ink mb-2">Divvy</h1>
        <p className="text-muted text-lg">Split the bill fairly.</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {billId && (
          <button
            type="button"
            onClick={handleContinue}
            className="btn-primary w-full focus-ring"
          >
            Continue current bill
          </button>
        )}
        <button
          type="button"
          onClick={handleStart}
          className={clsx(
            'w-full focus-ring',
            billId ? 'btn-ghost' : 'btn-primary',
          )}
        >
          <span role="img" aria-label="receipt">
            🧾
          </span>{' '}
          Start a new bill
        </button>
      </div>
    </div>
  )
}
