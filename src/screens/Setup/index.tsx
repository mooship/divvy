import clsx from 'clsx'
import { ChevronDown, Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { BottomAction } from '../../components/BottomAction'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CurrencyPicker } from '../../components/CurrencyPicker'
import { PageLayout } from '../../components/PageLayout'
import { PersonChip } from '../../components/PersonChip'
import { isDuplicateName } from '../../lib/validation'
import { useBillStore, usePrefsStore } from '../../store'
import { CURRENCY_CONFIG, type Currency, POPULAR_CURRENCIES } from '../../types'

export function Setup() {
  const navigate = useNavigate()
  const { currency, setCurrency, people, addPerson, removePerson } =
    useBillStore(
      useShallow((s) => ({
        currency: s.currency,
        setCurrency: s.setCurrency,
        people: s.people,
        addPerson: s.addPerson,
        removePerson: s.removePerson,
      })),
    )
  const setDefaultCurrency = usePrefsStore((s) => s.setDefaultCurrency)
  const [nameInput, setNameInput] = useState('')
  const [removingPersonId, setRemovingPersonId] = useState<string | null>(null)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  const quickCurrencies = useMemo(() => {
    const set = new Set(POPULAR_CURRENCIES)
    set.add(currency)
    return [...set].slice(0, 6)
  }, [currency])

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c)
    setDefaultCurrency(c)
  }

  const handleAddPerson = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) {
      return
    }
    if (isDuplicateName(trimmed, people)) {
      return
    }
    addPerson(trimmed)
    setNameInput('')
  }

  const canProceed = people.length >= 2

  const personToRemove = people.find((p) => p.id === removingPersonId)

  return (
    <PageLayout backTo="/" step={1}>
      <div className="min-h-screen bg-bg pb-24">
        <div className="px-4 pt-8">
          <h1 className="text-2xl font-bold text-ink mb-6">Set up the bill</h1>

          <section className="mb-8" aria-labelledby="currency-label">
            <h2 id="currency-label" className="section-label mb-3">
              Currency
            </h2>
            <fieldset
              className="flex gap-2 flex-wrap border-0 p-0 m-0"
              aria-labelledby="currency-label"
            >
              {quickCurrencies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCurrencyChange(c)}
                  className={clsx(
                    'px-4 h-10 rounded-lg font-medium transition-colors focus-ring',
                    currency === c
                      ? 'bg-coral text-white'
                      : 'bg-surface text-ink',
                  )}
                  aria-pressed={currency === c}
                >
                  {CURRENCY_CONFIG[c].symbol} {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCurrencyPicker(true)}
                className="px-4 h-10 rounded-lg font-medium transition-colors focus-ring bg-surface text-ink flex items-center gap-1"
              >
                More
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </button>
            </fieldset>
          </section>

          <section aria-labelledby="people-label">
            <h2 id="people-label" className="section-label mb-3">
              Who's at the table?
            </h2>

            {people.length < 2 && (
              <p
                className="text-sm text-muted mb-4 flex items-center gap-2"
                aria-live="polite"
              >
                <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                Add at least 2 people to continue
              </p>
            )}

            <ul
              className="flex flex-col gap-2 mb-4"
              aria-label="People at the table"
            >
              {people.map((person, i) => (
                <li
                  key={person.id}
                  className="card flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <PersonChip name={person.name} index={i} decorative />
                    <span className="font-medium text-ink">{person.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemovingPersonId(person.id)}
                    className="btn-icon-delete"
                    aria-label={`Remove ${person.name}`}
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="person-name" className="sr-only">
                  Person's name
                </label>
                <input
                  id="person-name"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
                  placeholder="Add a name..."
                  className="input-text focus-ring"
                />
              </div>
              <button
                type="button"
                onClick={handleAddPerson}
                disabled={!nameInput.trim()}
                className="btn-primary focus-ring px-4 min-w-12"
                aria-label="Add person"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>

        {showCurrencyPicker && (
          <CurrencyPicker
            selected={currency}
            onSelect={handleCurrencyChange}
            onClose={() => setShowCurrencyPicker(false)}
          />
        )}

        <ConfirmDialog
          open={removingPersonId !== null}
          title={`Remove ${personToRemove?.name ?? ''}?`}
          description="This person will be removed from the bill and unassigned from all items."
          confirmLabel="Remove"
          onConfirm={() => {
            if (removingPersonId) {
              removePerson(removingPersonId)
            }
            setRemovingPersonId(null)
          }}
          onCancel={() => setRemovingPersonId(null)}
        />

        <BottomAction>
          <button
            type="button"
            onClick={() => navigate('/items')}
            disabled={!canProceed}
            className="btn-primary w-full focus-ring"
          >
            Next — Add items
          </button>
        </BottomAction>
      </div>
    </PageLayout>
  )
}
