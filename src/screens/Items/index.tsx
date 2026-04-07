import { Camera, Pizza, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { BottomAction } from '../../components/BottomAction'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CurrencyInput } from '../../components/CurrencyInput'
import { PageLayout } from '../../components/PageLayout'
import { PersonChip } from '../../components/PersonChip'
import { formatCents } from '../../lib/calc'
import { isValidItem } from '../../lib/validation'
import { useBillStore, useOcrStore } from '../../store'

import { AssignModal } from './AssignModal'
import { OcrCapture } from './OcrCapture'
import { OcrConfirm } from './OcrConfirm'

export function Items() {
  const navigate = useNavigate()
  const { items, people, currency, addItem, removeItem } = useBillStore(
    useShallow((s) => ({
      items: s.items,
      people: s.people,
      currency: s.currency,
      addItem: s.addItem,
      removeItem: s.removeItem,
    })),
  )
  const ocrStatus = useOcrStore((s) => s.status)
  const clearOcr = useOcrStore((s) => s.clearOcr)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState(0)
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [showOcr, setShowOcr] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])
  const { personById, personIndexMap } = useMemo(
    () => ({
      personById: new Map(people.map((p) => [p.id, p])),
      personIndexMap: new Map(people.map((p, i) => [p.id, i])),
    }),
    [people],
  )

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!isValidItem(newName, newPrice)) {
      return
    }
    addItem(newName.trim(), newPrice)
    setNewName('')
    setNewPrice(0)
  }

  const handleOcrClose = () => {
    clearOcr()
    setShowOcr(false)
  }

  const itemToDelete = items.find((i) => i.id === deletingItemId)

  return (
    <PageLayout backTo="/setup" step={2}>
      <div className="min-h-screen bg-bg pb-24">
        <div className="px-4 pt-8">
          <h1 className="text-2xl font-bold text-ink mb-6">Add items</h1>

          <button
            type="button"
            onClick={() => setShowOcr(true)}
            className="w-full card p-4 flex items-center gap-3 text-left mb-6 focus-ring"
          >
            <Camera className="w-6 h-6 text-ink shrink-0" aria-hidden="true" />
            <div>
              <div className="font-bold text-ink">Scan receipt</div>
              <div className="text-sm text-muted">
                Take a photo or upload an image
              </div>
            </div>
          </button>

          {items.length === 0 ? (
            <p className="text-center text-muted py-8 flex items-center justify-center gap-2">
              <Pizza className="w-4 h-4" aria-hidden="true" />
              No items yet — scan a receipt or add one!
            </p>
          ) : (
            <ul className="flex flex-col gap-2 mb-4" aria-label="Bill items">
              {items.map((item) => {
                const assigned = item.assignedTo
                  .map((id) => personById.get(id))
                  .filter((p): p is (typeof people)[number] => p !== undefined)
                return (
                  <li key={item.id}>
                    <div className="card p-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-between focus-ring rounded-lg p-1 text-left"
                        onClick={() => setAssigningItemId(item.id)}
                        aria-label={`${item.name}, ${formatCents(item.price, currency)}, tap to assign`}
                      >
                        <div>
                          <div className="font-medium text-ink">
                            {item.name}
                          </div>
                          <div className="text-sm text-muted">
                            {formatCents(item.price, currency)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {assigned.length > 0 ? (
                            assigned.map((p) => (
                              <PersonChip
                                key={p.id}
                                name={p.name}
                                index={personIndexMap.get(p.id) ?? 0}
                                size="sm"
                                decorative
                              />
                            ))
                          ) : (
                            <span className="text-xs text-muted font-medium">
                              Everyone
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItemId(item.id)}
                        className="btn-icon-delete"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="card p-4">
            <h2 className="section-label mb-3">Add item manually</h2>
            <form
              onSubmit={handleAddItem}
              className="flex flex-col gap-2"
              noValidate
            >
              <div>
                <label htmlFor="item-name" className="sr-only">
                  Item name
                </label>
                <input
                  id="item-name"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Item name"
                  className="input-text focus-ring"
                />
              </div>
              <div>
                <label htmlFor="item-price" className="sr-only">
                  Item price
                </label>
                <CurrencyInput
                  id="item-price"
                  value={newPrice}
                  currency={currency}
                  onChange={setNewPrice}
                />
              </div>
              <button
                type="submit"
                disabled={!isValidItem(newName, newPrice)}
                className="btn-primary w-full focus-ring"
              >
                <Plus className="w-4 h-4" aria-hidden="true" /> Add item
              </button>
            </form>
          </div>
        </div>

        {assigningItemId && (
          <AssignModal
            key={assigningItemId}
            itemId={assigningItemId}
            onClose={() => setAssigningItemId(null)}
          />
        )}
        {showOcr && ocrStatus !== 'done' && (
          <OcrCapture onClose={handleOcrClose} />
        )}
        {showOcr && ocrStatus === 'done' && (
          <OcrConfirm onClose={handleOcrClose} />
        )}

        <ConfirmDialog
          open={deletingItemId !== null}
          title={`Delete ${itemToDelete?.name ?? ''}?`}
          description="This item will be removed from the bill."
          confirmLabel="Delete"
          onConfirm={() => {
            if (deletingItemId) {
              removeItem(deletingItemId)
            }
            setDeletingItemId(null)
          }}
          onCancel={() => setDeletingItemId(null)}
        />

        <BottomAction>
          {items.length === 0 && (
            <p className="text-sm text-muted text-center mb-2">
              Add at least one item to continue
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate('/extras')}
            disabled={items.length === 0}
            className="btn-primary w-full focus-ring"
          >
            Next — Extras
          </button>
        </BottomAction>
      </div>
    </PageLayout>
  )
}
