import { Check, Receipt, Share2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { BottomAction } from '../../components/BottomAction'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageLayout } from '../../components/PageLayout'
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
  const [copied, setCopied] = useState(false)
  const [showNewBillConfirm, setShowNewBillConfirm] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current)
      }
    }
  }, [])

  const reset = useBillStore((s) => s.reset)
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

  const d = readOnly ? searchParams.get('d') : null
  const bill: Bill | null = useMemo(() => {
    if (readOnly) {
      return d ? decodeBill(d) : null
    }
    return storeState
  }, [readOnly, d, storeState])

  const totals = useMemo(() => (bill ? calculateTotals(bill) : []), [bill])
  const grandTotal = totals.reduce((s, t) => s + t.total, 0)

  const handleShare = useCallback(async () => {
    if (!bill) {
      return
    }
    const url = `${window.location.origin}/bill?d=${encodeBill(bill)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Divvy bill', url })
      } else {
        await navigator.clipboard.writeText(url)
        if (copiedTimerRef.current) {
          clearTimeout(copiedTimerRef.current)
        }
        setCopied(true)
        copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // User cancelled share or clipboard not available
    }
  }, [bill])

  const handleNewBill = () => {
    setShowNewBillConfirm(true)
  }

  const handleConfirmNewBill = () => {
    setShowNewBillConfirm(false)
    reset()
    navigate('/')
  }

  if (!bill || totals.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
          <p className="text-muted text-center flex items-center gap-2">
            <Receipt className="w-4 h-4" aria-hidden="true" /> No bill data
            found.
          </p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      backTo={readOnly ? undefined : '/extras'}
      step={readOnly ? undefined : 4}
    >
      <div className="min-h-screen bg-bg pb-32">
        <div className="px-4 pt-8">
          <h1 className="text-2xl font-bold text-ink mb-6">
            {readOnly ? 'Bill summary' : 'Summary'}
          </h1>

          <div className="flex flex-col gap-4">
            {totals.map((total, i) => (
              <PersonCard
                key={total.personId}
                total={total}
                currency={bill.currency}
                personIndex={i}
              />
            ))}
          </div>

          <div className="card p-4 mt-4 text-center">
            <p className="text-sm text-muted mb-1">Grand total</p>
            <p className="text-3xl font-bold text-ink" aria-live="polite">
              {formatCents(grandTotal, bill.currency)}
            </p>
          </div>
        </div>

        <ConfirmDialog
          open={showNewBillConfirm}
          title="Start a new bill?"
          description="Your current bill will be saved to recent bills."
          confirmLabel="Start new"
          onConfirm={handleConfirmNewBill}
          onCancel={() => setShowNewBillConfirm(false)}
        />

        <BottomAction>
          {copied && (
            <p className="text-sm text-teal font-medium text-center mb-2 flex items-center justify-center gap-1">
              <Check className="w-4 h-4" aria-hidden="true" /> Link copied to
              clipboard
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="btn-primary flex-1 focus-ring"
              aria-label="Share bill"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" /> Share
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={handleNewBill}
                className="btn-ghost focus-ring"
              >
                New bill
              </button>
            )}
          </div>
        </BottomAction>
      </div>
    </PageLayout>
  )
}
