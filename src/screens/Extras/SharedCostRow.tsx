import clsx from 'clsx'
import { Plus, X } from 'lucide-react'
import { CurrencyInput } from '../../components/CurrencyInput'
import type { Currency, SharedCost } from '../../types'

interface SharedCostRowProps {
  label: string
  value: SharedCost
  currency: Currency
  onChange: (cost: SharedCost) => void
  hint?: string
  expanded: boolean
  onToggle: () => void
  collapsedHint?: string
}

export function SharedCostRow({
  label,
  value,
  currency,
  onChange,
  hint,
  expanded,
  onToggle,
  collapsedHint,
}: SharedCostRowProps) {
  const labelId = label.toLowerCase().replace(/\s+/g, '-')

  if (!expanded) {
    return (
      <section className="card p-4" aria-labelledby={labelId}>
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between focus-ring rounded-lg"
        >
          <div className="flex flex-col items-start">
            <h2 id={labelId} className="font-bold text-ink">
              {label}
            </h2>
            {collapsedHint && (
              <p className="text-xs text-muted mt-1">{collapsedHint}</p>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-coral">
            <Plus className="w-4 h-4" aria-hidden="true" /> Add
          </span>
        </button>
      </section>
    )
  }

  return (
    <section className="card p-4" aria-labelledby={labelId}>
      <div className="flex items-center justify-between mb-3">
        <h2 id={labelId} className="font-bold text-ink">
          {label}
        </h2>
        <div className="flex items-center gap-2">
          <fieldset
            className="flex rounded-lg overflow-hidden border-2 border-surface"
            aria-label={`${label} type`}
          >
            <button
              type="button"
              onClick={() => onChange({ type: 'percentage', value: 0 })}
              className={clsx(
                'min-h-11 px-4 text-sm font-bold focus-ring',
                value.type === 'percentage'
                  ? 'bg-coral text-white'
                  : 'bg-white text-ink',
              )}
              aria-pressed={value.type === 'percentage'}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => onChange({ type: 'fixed', value: 0 })}
              className={clsx(
                'min-h-11 px-4 text-sm font-bold focus-ring',
                value.type === 'fixed'
                  ? 'bg-coral text-white'
                  : 'bg-white text-ink',
              )}
              aria-pressed={value.type === 'fixed'}
            >
              Fixed
            </button>
          </fieldset>
          <button
            type="button"
            onClick={onToggle}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-muted hover:text-danger focus-ring"
            aria-label={`Remove ${label}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {hint && <p className="text-xs text-muted mb-3">{hint}</p>}

      {value.type === 'percentage' ? (
        <div className="relative">
          <label htmlFor={`${labelId}-input`} className="sr-only">
            {label} percentage
          </label>
          <input
            id={`${labelId}-input`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value.value || ''}
            onChange={(e) => {
              const n = parseFloat(e.target.value)
              onChange({
                type: 'percentage',
                value: Number.isNaN(n) ? 0 : Math.max(0, n),
              })
            }}
            placeholder="0"
            className="input-text focus-ring pr-8"
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted select-none"
            aria-hidden="true"
          >
            %
          </span>
        </div>
      ) : (
        <>
          <label htmlFor={`${labelId}-input`} className="sr-only">
            {label} fixed amount
          </label>
          <CurrencyInput
            id={`${labelId}-input`}
            value={value.value}
            currency={currency}
            onChange={(v) => onChange({ type: 'fixed', value: v })}
          />
        </>
      )}
    </section>
  )
}
