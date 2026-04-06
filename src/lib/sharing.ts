import LZString from 'lz-string'
import { type Bill, CURRENCY_CONFIG, type SharedCost } from '../types'

export function encodeBill(bill: Bill): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(bill))
}

function isValidSharedCost(obj: unknown): obj is SharedCost {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }
  const s = obj as Record<string, unknown>
  if (s.type !== 'percentage' && s.type !== 'fixed') {
    return false
  }
  if (typeof s.value !== 'number' || s.value < 0) {
    return false
  }
  return true
}

function isValidBill(obj: unknown): obj is Bill {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }
  const b = obj as Record<string, unknown>
  if (typeof b.id !== 'string') {
    return false
  }
  if (typeof b.currency !== 'string' || !(b.currency in CURRENCY_CONFIG)) {
    return false
  }
  if (!Array.isArray(b.people) || !Array.isArray(b.items)) {
    return false
  }
  if (
    !isValidSharedCost(b.tip) ||
    !isValidSharedCost(b.serviceFee) ||
    !isValidSharedCost(b.deliveryFee)
  ) {
    return false
  }
  for (const p of b.people) {
    if (typeof p !== 'object' || p === null) {
      return false
    }
    const person = p as Record<string, unknown>
    if (typeof person.id !== 'string' || typeof person.name !== 'string') {
      return false
    }
  }
  for (const item of b.items) {
    if (typeof item !== 'object' || item === null) {
      return false
    }
    const it = item as Record<string, unknown>
    if (
      typeof it.id !== 'string' ||
      typeof it.name !== 'string' ||
      typeof it.price !== 'number' ||
      it.price < 0 ||
      !Number.isInteger(it.price) ||
      !Array.isArray(it.assignedTo)
    ) {
      return false
    }
  }
  return true
}

export function decodeBill(encoded: string): Bill | null {
  if (!encoded) {
    return null
  }
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) {
      return null
    }
    const parsed: unknown = JSON.parse(json)
    if (!isValidBill(parsed)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}
