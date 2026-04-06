import { Check } from 'lucide-react'
import { useShallow } from 'zustand/shallow'
import { BottomSheet } from '../../components/BottomSheet'
import { CurrencyInput } from '../../components/CurrencyInput'
import { useBillStore, useOcrStore } from '../../store'

interface OcrConfirmProps {
  onClose: () => void
}

export function OcrConfirm({ onClose }: OcrConfirmProps) {
  const { candidates, setCandidates, toggleCandidate, clearOcr } = useOcrStore(
    useShallow((s) => ({
      candidates: s.candidates,
      setCandidates: s.setCandidates,
      toggleCandidate: s.toggleCandidate,
      clearOcr: s.clearOcr,
    })),
  )
  const addItem = useBillStore((s) => s.addItem)
  const currency = useBillStore((s) => s.currency)

  const handleConfirm = () => {
    for (const candidate of candidates.filter((c) => c.selected)) {
      addItem(candidate.name, candidate.price)
    }
    clearOcr()
    onClose()
  }

  const updateName = (index: number, name: string) => {
    setCandidates(candidates.map((c, i) => (i === index ? { ...c, name } : c)))
  }

  const updatePrice = (index: number, price: number) => {
    setCandidates(candidates.map((c, i) => (i === index ? { ...c, price } : c)))
  }

  const selectedCount = candidates.filter((c) => c.selected).length

  if (candidates.length === 0) {
    return (
      <BottomSheet ariaLabel="No items found">
        <h2 className="text-lg font-bold text-ink mb-2">No items found</h2>
        <p className="text-muted text-sm mb-4">
          The receipt scan didn't find any items. Try again with a clearer
          photo.
        </p>
        <button
          type="button"
          onClick={() => {
            clearOcr()
            onClose()
          }}
          className="btn-primary w-full focus-ring"
        >
          Try again
        </button>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet
      className="max-h-[90vh] flex flex-col"
      ariaLabel="Confirm items"
    >
      <h2 className="text-lg font-bold text-ink mb-1">Confirm items</h2>
      <p className="text-sm text-muted mb-4">
        Review the scanned items. Uncheck any you don't want to add.
      </p>

      <ul
        className="flex flex-col gap-2 overflow-y-auto flex-1 mb-4"
        aria-label="Scanned items"
      >
        {candidates.map((candidate, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: OCR candidates don't reorder
          <li key={i} className="flex items-start gap-2">
            {/* biome-ignore lint/a11y/useSemanticElements: custom-styled checkbox uses button for layout */}
            <button
              type="button"
              onClick={() => toggleCandidate(i)}
              className="mt-3 w-5 h-5 rounded border-2 border-coral flex items-center justify-center shrink-0 focus-ring"
              role="checkbox"
              aria-checked={candidate.selected}
              aria-label={
                candidate.selected
                  ? `Deselect ${candidate.name}`
                  : `Select ${candidate.name}`
              }
            >
              {candidate.selected && (
                <Check className="w-3 h-3 text-coral" aria-hidden="true" />
              )}
            </button>
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <label htmlFor={`ocr-name-${i}`} className="sr-only">
                  Item name
                </label>
                <input
                  id={`ocr-name-${i}`}
                  type="text"
                  value={candidate.name}
                  onChange={(e) => updateName(i, e.target.value)}
                  className="input-text focus-ring text-sm h-10"
                  disabled={!candidate.selected}
                />
              </div>
              <div className="w-28">
                <label htmlFor={`ocr-price-${i}`} className="sr-only">
                  Item price
                </label>
                <CurrencyInput
                  id={`ocr-price-${i}`}
                  value={candidate.price}
                  currency={currency}
                  onChange={(price) => updatePrice(i, price)}
                  className="h-10"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selectedCount === 0}
          className="btn-primary flex-1 focus-ring"
        >
          Add {selectedCount} item{selectedCount !== 1 ? 's' : ''} to bill
        </button>
        <button
          type="button"
          onClick={() => {
            clearOcr()
            onClose()
          }}
          className="btn-ghost focus-ring"
        >
          Cancel
        </button>
      </div>
    </BottomSheet>
  )
}
