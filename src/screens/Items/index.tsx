import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomAction } from '../../components/BottomAction'
import { CurrencyInput } from '../../components/CurrencyInput'
import { PersonChip } from '../../components/PersonChip'
import { formatCents } from '../../lib/calc'
import { useBillStore } from '../../store'

// Placeholders — replaced in Tasks 11 and 15
const AssignModal = (_props: { itemId: string; onClose: () => void }) => null
const OcrCapture = (_props: { onClose: () => void }) => null

export function Items() {
  const navigate = useNavigate()
  const { items, people, currency, addItem, removeItem } = useBillStore()
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState(0)
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null)
  const [showOcr, setShowOcr] = useState(false)

  const handleAddItem = () => {
    if (!newName.trim() || newPrice <= 0) return
    addItem(newName.trim(), newPrice)
    setNewName('')
    setNewPrice(0)
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Add items</h1>

        <button
          type="button"
          onClick={() => setShowOcr(true)}
          className="w-full card p-4 flex items-center gap-3 text-left mb-6 focus-ring"
        >
          <span aria-hidden="true" className="text-2xl">
            📷
          </span>
          <div>
            <div className="font-bold text-ink">Scan receipt</div>
            <div className="text-sm text-muted">
              Take a photo or upload an image
            </div>
          </div>
        </button>

        {items.length === 0 ? (
          <p className="text-center text-muted py-8">
            <span aria-hidden="true">🍕</span> No items yet — scan a receipt or
            add one!
          </p>
        ) : (
          <ul className="flex flex-col gap-2 mb-4" aria-label="Bill items">
            {items.map((item) => {
              const assigned = people.filter((p) =>
                item.assignedTo.includes(p.id),
              )
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
                        <div className="font-medium text-ink">{item.name}</div>
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
                              index={people.indexOf(p)}
                              size="sm"
                              decorative
                            />
                          ))
                        ) : (
                          <span className="text-xs text-danger font-medium">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-muted hover:text-danger transition-colors focus-ring rounded-lg shrink-0"
                      aria-label={`Delete ${item.name}`}
                    >
                      <span aria-hidden="true">🗑️</span>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="card p-4">
          <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
            Add item manually
          </h2>
          <div className="flex flex-col gap-2">
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
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
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
              type="button"
              onClick={handleAddItem}
              disabled={!newName.trim() || newPrice <= 0}
              className="btn-primary w-full focus-ring"
            >
              <span aria-hidden="true">➕</span> Add item
            </button>
          </div>
        </div>
      </div>

      {assigningItemId && (
        <AssignModal
          itemId={assigningItemId}
          onClose={() => setAssigningItemId(null)}
        />
      )}
      {showOcr && <OcrCapture onClose={() => setShowOcr(false)} />}

      <BottomAction>
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
  )
}
