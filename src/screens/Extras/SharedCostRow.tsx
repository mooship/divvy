import clsx from 'clsx'
import { CurrencyInput } from '../../components/CurrencyInput'
import type { Currency, SharedCost } from '../../types'

interface SharedCostRowProps {
  label: string
  labelId: string
  value: SharedCost
  currency: Currency
  onChange: (cost: SharedCost) => void
}

export function SharedCostRow({
  label,
  labelId,
  value,
  currency,
  onChange,
}: SharedCostRowProps) {
  return (
    <div className="card p-4" aria-labelledby={labelId}>
      <div className="flex items-center justify-between mb-3">
        <h2 id={labelId} className="font-bold text-ink">
          {label}
        </h2>
        <div
          className="flex rounded-lg overflow-hidden border-2 border-surface"
          role="group"
          aria-label={`${label} type`}
        >
          <button
            type="button"
            onClick={() => onChange({ type: 'percentage', value: 0 })}
            className={clsx(
              'px-3 py-1 text-sm font-bold focus-ring',
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
              'px-3 py-1 text-sm font-bold focus-ring',
              value.type === 'fixed'
                ? 'bg-coral text-white'
                : 'bg-white text-ink',
            )}
            aria-pressed={value.type === 'fixed'}
          >
            Fixed
          </button>
        </div>
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
                value: isNaN(n) ? 0 : Math.max(0, n),
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
    </div>
  )
}
