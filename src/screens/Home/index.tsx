import clsx from 'clsx'
import { Receipt, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageLayout } from '../../components/PageLayout'
import { formatCents } from '../../lib/calc'
import { deleteRecentBill, getRecentBills, useBillStore } from '../../store'
import type { BillSummary } from '../../types'

export function Home() {
  const navigate = useNavigate()
  const hasBill = useBillStore((s) => Boolean(s.id && s.people.length > 0))
  const reset = useBillStore((s) => s.reset)
  const [recentBills, setRecentBills] = useState<BillSummary[]>([])

  useEffect(() => {
    setRecentBills(getRecentBills())
  }, [])

  const [showNewBillConfirm, setShowNewBillConfirm] = useState(false)
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null)

  const handleDeleteBill = () => {
    if (deletingBillId) {
      setRecentBills(deleteRecentBill(deletingBillId))
    }
    setDeletingBillId(null)
  }

  const handleStart = () => {
    if (hasBill) {
      setShowNewBillConfirm(true)
      return
    }
    reset()
    navigate('/setup')
  }

  const handleConfirmNewBill = () => {
    setShowNewBillConfirm(false)
    reset()
    navigate('/setup')
  }

  const handleContinue = () => {
    navigate('/items')
  }

  return (
    <PageLayout>
      <div
        className="bg-bg flex flex-col px-4 pt-4"
        style={{
          minHeight: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))',
          paddingBottom:
            'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink mb-1">
              Split the bill fairly.
            </h1>
            <p className="text-muted">Add items, assign to people, done.</p>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-3">
            {hasBill && (
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
                hasBill ? 'btn-ghost' : 'btn-primary',
              )}
            >
              <Receipt className="w-4 h-4" aria-hidden="true" /> Start a new
              bill
            </button>
          </div>
        </div>

        {recentBills.length > 0 && (
          <section className="mt-8" aria-labelledby="recent-label">
            <h2 id="recent-label" className="section-label mb-3">
              Recent bills
            </h2>
            <ul className="flex flex-col gap-2">
              {recentBills.map((bill) => {
                const dateStr = new Date(bill.date).toLocaleDateString()
                const inner = (
                  <>
                    <div>
                      <p className="font-medium text-ink">
                        {bill.peopleCount} people
                      </p>
                      <p className="text-xs text-muted">{dateStr}</p>
                    </div>
                    <span className="font-bold text-ink">
                      {formatCents(bill.total, bill.currency)}
                    </span>
                  </>
                )
                return (
                  <li
                    key={bill.id}
                    className="card p-3 flex items-center gap-2"
                  >
                    {bill.encoded ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/bill?d=${bill.encoded}`)}
                        className="flex-1 flex justify-between items-center focus-ring rounded-lg p-1 text-left"
                      >
                        {inner}
                      </button>
                    ) : (
                      <div className="flex-1 flex justify-between items-center p-1">
                        {inner}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeletingBillId(bill.id)}
                      className="btn-icon-delete"
                      aria-label={`Delete bill from ${dateStr}`}
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <ConfirmDialog
          open={deletingBillId !== null}
          title="Delete this bill?"
          description="This bill will be permanently removed from your recent bills."
          confirmLabel="Delete"
          onConfirm={handleDeleteBill}
          onCancel={() => setDeletingBillId(null)}
        />

        <ConfirmDialog
          open={showNewBillConfirm}
          title="Start a new bill?"
          description="Your current bill will be saved to recent bills, but any unsaved changes will be lost."
          confirmLabel="Start new"
          onConfirm={handleConfirmNewBill}
          onCancel={() => setShowNewBillConfirm(false)}
        />

        <footer className="mt-6 text-center">
          <Link
            to="/privacy"
            className="text-xs text-muted hover:text-ink focus-ring rounded"
          >
            Privacy Policy
          </Link>
        </footer>
      </div>
    </PageLayout>
  )
}
