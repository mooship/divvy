import { useState } from 'react'
import { BottomSheet } from '../../components/BottomSheet'
import { CurrencyInput } from '../../components/CurrencyInput'
import { isValidItem } from '../../lib/validation'
import { useBillStore } from '../../store'
import type { Currency, Item } from '../../types'

interface EditItemSheetProps {
  item: Item
  currency: Currency
  onClose: () => void
}

export function EditItemSheet({ item, currency, onClose }: EditItemSheetProps) {
  const updateItem = useBillStore((s) => s.updateItem)
  const [name, setName] = useState(item.name)
  const [price, setPrice] = useState(item.price)

  const handleSave = () => {
    if (!isValidItem(name, price)) {
      return
    }
    updateItem(item.id, { name: name.trim(), price })
    onClose()
  }

  return (
    <BottomSheet ariaLabel="Edit item" onClose={onClose}>
      <h2 className="text-lg font-bold text-ink mb-4">Edit item</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
        className="flex flex-col gap-3"
        noValidate
      >
        <div>
          <label htmlFor="edit-item-name" className="sr-only">
            Item name
          </label>
          <input
            id="edit-item-name"
            type="text"
            inputMode="text"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            maxLength={60}
            className="input-text focus-ring"
          />
        </div>
        <div>
          <label htmlFor="edit-item-price" className="sr-only">
            Item price
          </label>
          <CurrencyInput
            id="edit-item-price"
            value={price}
            currency={currency}
            onChange={setPrice}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex-1 focus-ring"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValidItem(name, price)}
            className="btn-primary flex-1 focus-ring"
          >
            Save
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
