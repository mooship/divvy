import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { BottomAction } from '../../components/BottomAction'
import { calculateTotals, formatCents } from '../../lib/calc'
import { decodeBill, encodeBill } from '../../lib/sharing'
import { useBillStore } from '../../store'
import type { Bill } from '../../types'
import { PersonCard } from './PersonCard'

interface SummaryProps {
  readOnly?: boolean
}

export function Summary({ readOnly = false }: SummaryProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const storeState = useBillStore(
    useShallow((s) => ({
      id: s.id,
      currency: s.currency,
      people: s.people,
      items: s.items,
      tip: s.tip,
      serviceFee: s.serviceFee,
      deliveryFee: s.deliveryFee,
    })),
  )

  const bill: Bill | null = useMemo(() => {
    if (readOnly) {
      const d = searchParams.get('d')
      return d ? decodeBill(d) : null
    }
    return storeState
  }, [readOnly, searchParams, storeState])

  const totals = useMemo(() => (bill ? calculateTotals(bill) : []), [bill])
  const grandTotal = totals.reduce((s, t) => s + t.total, 0)

  const handleShare = async () => {
    if (!bill) {
      return
    }
    const url = `${window.location.origin}/bill?d=${encodeBill(bill)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Divvy bill', url })
      } else {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      // User cancelled share or clipboard not available
    }
  }

  if (totals.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <p className="text-muted text-center">
          <span aria-hidden="true">🧾</span> No bill data found.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-32">
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-bold text-ink mb-6">
          {readOnly ? 'Bill summary' : 'Summary'}
        </h1>

        <div className="flex flex-col gap-4">
          {totals.map((total) => (
            <PersonCard
              key={total.personId}
              total={total}
              currency={bill?.currency ?? 'USD'}
            />
          ))}
        </div>

        <div className="card p-4 mt-4 text-center">
          <p className="text-sm text-muted mb-1">Grand total</p>
          <p className="text-3xl font-bold text-ink" aria-live="polite">
            {formatCents(grandTotal, bill?.currency ?? 'USD')}
          </p>
        </div>
      </div>

      <BottomAction>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="btn-primary flex-1 focus-ring"
            aria-label="Share bill"
          >
            <span aria-hidden="true">📤</span> Share
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-ghost focus-ring"
            >
              New bill
            </button>
          )}
        </div>
      </BottomAction>
    </div>
  )
}
