import clsx from 'clsx'
import { CurrencyInput } from '../../components/CurrencyInput'
import type { Currency, SharedCost } from '../../types'

interface SharedCostRowProps {
  label: string
  value: SharedCost
  currency: Currency
  onChange: (cost: SharedCost) => void
  hint?: string
}

export function SharedCostRow({
  label,
  value,
  currency,
  onChange,
  hint,
}: SharedCostRowProps) {
  const labelId = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <section className="card p-4" aria-labelledby={labelId}>
      {hint && <p className="text-xs text-muted mb-2">{hint}</p>}
      <div className="flex items-center justify-between mb-3">
        <h2 id={labelId} className="font-bold text-ink">
          {label}
        </h2>
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
      </div>

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
