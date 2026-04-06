import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bill, Currency, Item, SharedCost } from '../types'

interface BillActions {
  addPerson: (name: string) => void
  removePerson: (id: string) => void
  addItem: (name: string, price: number) => void
  updateItem: (id: string, updates: Partial<Pick<Item, 'name' | 'price'>>) => void
  removeItem: (id: string) => void
  assignItem: (itemId: string, personIds: string[]) => void
  setSharedCost: (key: 'tip' | 'serviceFee' | 'deliveryFee', cost: SharedCost) => void
  setCurrency: (currency: Currency) => void
  loadBill: (bill: Bill) => void
  reset: () => void
}

const DEFAULT_BILL: Bill = {
  id: '',
  currency: 'ZAR',
  people: [],
  items: [],
  tip: { type: 'percentage', value: 0 },
  serviceFee: { type: 'fixed', value: 0 },
  deliveryFee: { type: 'fixed', value: 0 },
}

export const useBillStore = create<Bill & BillActions>()(
  persist(
    set => ({
      ...DEFAULT_BILL,
      addPerson: name =>
        set(s => ({ people: [...s.people, { id: crypto.randomUUID(), name }] })),
      removePerson: id =>
        set(s => ({
          people: s.people.filter(p => p.id !== id),
          items: s.items.map(item => ({
            ...item,
            assignedTo: item.assignedTo.filter(pid => pid !== id),
          })),
        })),
      addItem: (name, price) =>
        set(s => ({
          items: [...s.items, { id: crypto.randomUUID(), name, price, assignedTo: [] }],
        })),
      updateItem: (id, updates) =>
        set(s => ({
          items: s.items.map(item => (item.id === id ? { ...item, ...updates } : item)),
        })),
      removeItem: id => set(s => ({ items: s.items.filter(item => item.id !== id) })),
      assignItem: (itemId, personIds) =>
        set(s => ({
          items: s.items.map(item =>
            item.id === itemId ? { ...item, assignedTo: personIds } : item,
          ),
        })),
      setSharedCost: (key, cost) => set({ [key]: cost }),
      setCurrency: currency => set({ currency }),
      loadBill: bill => set(bill),
      reset: () => set({ ...DEFAULT_BILL, id: crypto.randomUUID() }),
    }),
    { name: 'divvy-bill' },
  ),
)
