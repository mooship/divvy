import clsx from 'clsx'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CURRENCY_CONFIG, type Currency } from '../types'
import { BottomSheet } from './BottomSheet'

interface CurrencyPickerProps {
  selected: Currency
  onSelect: (currency: Currency) => void
  onClose: () => void
}

const ALL_CURRENCIES = Object.keys(CURRENCY_CONFIG) as Currency[]

export function CurrencyPicker({
  selected,
  onSelect,
  onClose,
}: CurrencyPickerProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return ALL_CURRENCIES
    }
    const q = query.trim().toLowerCase()
    return ALL_CURRENCIES.filter((code) => {
      const config = CURRENCY_CONFIG[code]
      return (
        code.toLowerCase().includes(q) ||
        config.name.toLowerCase().includes(q) ||
        config.symbol.toLowerCase().includes(q)
      )
    })
  }, [query])

  return (
    <BottomSheet
      className="max-h-[85vh] flex flex-col"
      ariaLabel="Select currency"
      onClose={onClose}
    >
      <h2 className="text-lg font-bold text-ink mb-3">Select currency</h2>
      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          aria-hidden="true"
        />
        <input
          type="text"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search currencies..."
          className="input-text focus-ring pl-9 w-full"
        />
      </div>
      <ul
        className="flex flex-col overflow-y-auto flex-1"
        aria-label="Currencies"
      >
        {filtered.map((code) => {
          const config = CURRENCY_CONFIG[code]
          const isSelected = code === selected
          return (
            <li key={code}>
              <button
                type="button"
                onClick={() => {
                  onSelect(code)
                  onClose()
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors focus-ring',
                  isSelected
                    ? 'bg-coral text-white'
                    : 'text-ink hover:bg-surface',
                )}
                aria-pressed={isSelected}
              >
                <span className="w-10 text-center font-medium shrink-0">
                  {config.symbol}
                </span>
                <span className="flex-1">
                  <span className="font-medium">{code}</span>
                  <span
                    className={clsx(
                      'ml-2 text-sm',
                      isSelected ? 'text-white/80' : 'text-muted',
                    )}
                  >
                    {config.name}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="text-sm text-muted text-center py-6">
            No currencies match your search
          </li>
        )}
      </ul>
    </BottomSheet>
  )
}
