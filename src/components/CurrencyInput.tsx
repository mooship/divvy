import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { CURRENCY_CONFIG, type Currency } from '../types'

interface CurrencyInputProps {
  value: number // cents
  currency: Currency
  onChange: (cents: number) => void
  id?: string
  className?: string
  placeholder?: string
}

export function CurrencyInput({
  value,
  currency,
  onChange,
  id,
  className,
  placeholder,
}: CurrencyInputProps) {
  const config = CURRENCY_CONFIG[currency]
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState(() =>
    value > 0
      ? (value / 100).toFixed(2).replace('.', config.decimalSeparator)
      : '',
  )

  // Sync when value or currency changes externally (e.g. store reset, URL load, currency switch)
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(
        value > 0
          ? (value / 100).toFixed(2).replace('.', config.decimalSeparator)
          : '',
      )
    }
  }, [value, config.decimalSeparator, isFocused])

  const handleBlur = () => {
    setIsFocused(false)
    // Strip thousands separators, then normalise decimal separator to '.'
    const normalised = localValue
      .replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '')
      .replace(config.decimalSeparator, '.')
    const parsed = parseFloat(normalised)
    if (!isNaN(parsed) && parsed >= 0) {
      const cents = Math.round(parsed * 100)
      onChange(cents)
      setLocalValue(
        (cents / 100).toFixed(2).replace('.', config.decimalSeparator),
      )
    } else {
      onChange(0)
      setLocalValue('')
    }
  }

  return (
    <div className={clsx('relative flex items-center', className)}>
      {config.symbolPosition === 'prefix' && (
        <span
          className="absolute left-3 text-muted select-none pointer-events-none"
          aria-hidden="true"
        >
          {config.symbol}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder ?? `0${config.decimalSeparator}00`}
        className={clsx(
          'input-text focus-ring',
          config.symbolPosition === 'prefix' ? 'pl-8' : 'pr-8',
        )}
      />
      {config.symbolPosition === 'suffix' && (
        <span
          className="absolute right-3 text-muted select-none pointer-events-none"
          aria-hidden="true"
        >
          {config.symbol}
        </span>
      )}
    </div>
  )
}
