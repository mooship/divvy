import { Check, X } from 'lucide-react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { BottomSheet } from '../../components/BottomSheet'
import { CurrencyInput } from '../../components/CurrencyInput'
import { parseReceiptLines } from '../../lib/ocr'
import type { OcrCandidate } from '../../store'
import { useBillStore, useOcrStore } from '../../store'
import { CURRENCY_CONFIG } from '../../types'

interface OcrConfirmProps {
  onClose: () => void
}

export function OcrConfirm({ onClose }: OcrConfirmProps) {
  const {
    candidates,
    setCandidates,
    toggleCandidate,
    rawLines,
    detectedCurrency,
    setDetectedCurrency,
    clearOcr,
  } = useOcrStore(
    useShallow((s) => ({
      candidates: s.candidates,
      setCandidates: s.setCandidates,
      toggleCandidate: s.toggleCandidate,
      rawLines: s.rawLines,
      detectedCurrency: s.detectedCurrency,
      setDetectedCurrency: s.setDetectedCurrency,
      clearOcr: s.clearOcr,
    })),
  )
  const addItem = useBillStore((s) => s.addItem)
  const setCurrency = useBillStore((s) => s.setCurrency)
  const currency = useBillStore((s) => s.currency)

  const handleSwitchCurrency = () => {
    if (!detectedCurrency || rawLines.length === 0) {
      return
    }
    setCurrency(detectedCurrency)
    const reparsed = parseReceiptLines(rawLines, detectedCurrency)
    setCandidates(reparsed.map((p) => ({ ...p, selected: true })))
    setDetectedCurrency(null)
  }

  const selectedCandidates = useMemo(
    () => candidates.filter((c) => c.selected),
    [candidates],
  )

  const handleConfirm = () => {
    for (const candidate of selectedCandidates) {
      addItem(candidate.name, candidate.price)
    }
    clearOcr()
    onClose()
  }

  const updateCandidate = <K extends keyof OcrCandidate>(
    index: number,
    key: K,
    value: OcrCandidate[K],
  ) => {
    setCandidates(
      candidates.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    )
  }

  const selectedCount = selectedCandidates.length

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

      {detectedCurrency && detectedCurrency !== currency && (
        <div
          className="flex items-center gap-2 bg-teal/10 text-teal rounded-lg px-3 py-2 mb-4 text-sm"
          role="status"
        >
          <span className="flex-1">
            This receipt looks like{' '}
            <strong>
              {CURRENCY_CONFIG[detectedCurrency].symbol} {detectedCurrency}
            </strong>
            . Switch?
          </span>
          <button
            type="button"
            onClick={handleSwitchCurrency}
            className="font-bold underline shrink-0"
          >
            Switch
          </button>
          <button
            type="button"
            onClick={() => setDetectedCurrency(null)}
            className="shrink-0"
            aria-label="Dismiss currency suggestion"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

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
              className="mt-1 min-w-11 min-h-11 flex items-center justify-center shrink-0 focus-ring rounded-lg"
              role="checkbox"
              aria-checked={candidate.selected}
              aria-label={
                candidate.selected
                  ? `Deselect ${candidate.name}`
                  : `Select ${candidate.name}`
              }
            >
              <span className="w-5 h-5 rounded border-2 border-coral flex items-center justify-center">
                {candidate.selected && (
                  <Check className="w-3 h-3 text-coral" aria-hidden="true" />
                )}
              </span>
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
                  onChange={(e) => updateCandidate(i, 'name', e.target.value)}
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
                  onChange={(price) => updateCandidate(i, 'price', price)}
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
