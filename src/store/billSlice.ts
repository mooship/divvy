import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateTotals } from '../lib/calc'
import { encodeBill } from '../lib/sharing'
import { STORAGE_KEYS } from '../lib/storageKeys'
import type { Bill, BillSummary, Currency, Item, SharedCost } from '../types'

interface BillActions {
  addPerson: (name: string) => void
  removePerson: (id: string) => void
  addItem: (name: string, price: number) => void
  updateItem: (
    id: string,
    updates: Partial<Pick<Item, 'name' | 'price'>>,
  ) => void
  removeItem: (id: string) => void
  assignItem: (itemId: string, personIds: string[]) => void
  setSharedCost: (
    key: 'tip' | 'serviceFee' | 'deliveryFee' | 'tax' | 'discount',
    cost: SharedCost,
  ) => void
  setCurrency: (currency: Currency) => void
  clearAllAssignments: () => void
  reset: () => void
}

const MAX_RECENT = 5

function saveToRecent(bill: Bill): void {
  if (!bill.id || bill.items.length === 0) {
    return
  }
  const totals = calculateTotals(bill)
  const grandTotal = totals.reduce((s, t) => s + t.total, 0)
  const summary: BillSummary = {
    id: bill.id,
    date: new Date().toISOString(),
    peopleCount: bill.people.length,
    total: grandTotal,
    currency: bill.currency,
    encoded: encodeBill(bill),
  }
  try {
    const existing: BillSummary[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.RECENT_BILLS) ?? '[]',
    )
    const updated = [
      summary,
      ...existing.filter((b) => b.id !== bill.id),
    ].slice(0, MAX_RECENT)
    localStorage.setItem(STORAGE_KEYS.RECENT_BILLS, JSON.stringify(updated))
  } catch {
    // localStorage unavailable or corrupt — silently skip
  }
}

export function getRecentBills(): BillSummary[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_BILLS) ?? '[]')
  } catch {
    return []
  }
}

export function deleteRecentBill(id: string): BillSummary[] {
  try {
    const existing: BillSummary[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.RECENT_BILLS) ?? '[]',
    )
    const updated = existing.filter((b) => b.id !== id)
    localStorage.setItem(STORAGE_KEYS.RECENT_BILLS, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

const DEFAULT_BILL: Bill = {
  id: '',
  currency: 'ZAR',
  people: [],
  items: [],
  tip: { type: 'percentage', value: 0 },
  serviceFee: { type: 'fixed', value: 0 },
  deliveryFee: { type: 'fixed', value: 0 },
  tax: { type: 'percentage', value: 0 },
  discount: { type: 'fixed', value: 0 },
}

export const useBillStore = create<Bill & BillActions>()(
  persist(
    (set) => ({
      ...DEFAULT_BILL,
      addPerson: (name) =>
        set((s) => ({
          people: [...s.people, { id: crypto.randomUUID(), name }],
        })),
      removePerson: (id) =>
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
          items: s.items.map((item) => ({
            ...item,
            assignedTo: item.assignedTo.filter((pid) => pid !== id),
          })),
        })),
      addItem: (name, price) =>
        set((s) => ({
          items: [
            ...s.items,
            { id: crypto.randomUUID(), name, price, assignedTo: [] },
          ],
        })),
      updateItem: (id, updates) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((item) => item.id !== id) })),
      assignItem: (itemId, personIds) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === itemId ? { ...item, assignedTo: personIds } : item,
          ),
        })),
      setSharedCost: (key, cost) => set({ [key]: cost }),
      setCurrency: (currency) => set({ currency }),
      clearAllAssignments: () =>
        set((s) => ({
          items: s.items.map((item) => ({ ...item, assignedTo: [] })),
        })),
      reset: () =>
        set((state) => {
          saveToRecent(state)
          return { ...DEFAULT_BILL, id: crypto.randomUUID() }
        }),
    }),
    { name: STORAGE_KEYS.BILL },
  ),
)
