import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { centsToDecimal, parseCents } from '../lib/calc'
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
  const thousandsRe = useMemo(
    () => new RegExp(`\\${config.thousandsSeparator}`, 'g'),
    [config.thousandsSeparator],
  )
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState(() =>
    value > 0
      ? centsToDecimal(value, config.decimalSeparator, config.decimals)
      : '',
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: isFocused intentionally omitted — effect only syncs external value changes; blur is handled by handleBlur directly to avoid a double setState
  useEffect(() => {
    if (isFocused) {
      return
    }
    setLocalValue(
      value > 0
        ? centsToDecimal(value, config.decimalSeparator, config.decimals)
        : '',
    )
  }, [value, config.decimalSeparator, config.decimals])

  const handleBlur = () => {
    setIsFocused(false)
    const cents = parseCents(
      localValue,
      thousandsRe,
      config.decimalSeparator,
      config.decimals,
    )
    if (cents !== null) {
      onChange(cents)
      setLocalValue(
        centsToDecimal(cents, config.decimalSeparator, config.decimals),
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
        inputMode={config.decimals === 0 ? 'numeric' : 'decimal'}
        autoComplete="off"
        value={localValue}
        onChange={(e) => {
          const raw = e.target.value
          setLocalValue(raw)
          const cents = parseCents(
            raw,
            thousandsRe,
            config.decimalSeparator,
            config.decimals,
          )
          if (cents !== null) {
            onChange(cents)
          } else if (raw === '') {
            onChange(0)
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={
          placeholder ??
          (config.decimals === 0 ? '0' : `0${config.decimalSeparator}00`)
        }
        className={clsx(
          'input-text focus-ring',
          config.symbolPosition === 'prefix'
            ? config.symbol.length > 2
              ? 'pl-14'
              : config.symbol.length > 1
                ? 'pl-12'
                : 'pl-8'
            : 'pr-10',
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
