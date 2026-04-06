import { describe, it, expect } from 'vitest'
import { encodeBill, decodeBill } from './sharing'
import type { Bill } from '../types'

const bill: Bill = {
  id: 'test-1',
  currency: 'USD',
  people: [
    { id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' },
  ],
  items: [
    { id: 'i1', name: 'Pizza', price: 2000, assignedTo: ['alice'] },
    { id: 'i2', name: 'Coke', price: 500, assignedTo: ['alice', 'bob'] },
  ],
  tip: { type: 'percentage', value: 10 },
  serviceFee: { type: 'fixed', value: 0 },
  deliveryFee: { type: 'fixed', value: 0 },
}

describe('sharing', () => {
  it('round-trips a bill through encode/decode', () => {
    const encoded = encodeBill(bill)
    const decoded = decodeBill(encoded)
    expect(decoded).toEqual(bill)
  })

  it('encoded string is non-empty', () => {
    expect(encodeBill(bill).length).toBeGreaterThan(0)
  })

  it('encoded string is URL-safe (no raw spaces or JSON chars)', () => {
    const encoded = encodeBill(bill)
    expect(encoded).not.toContain(' ')
    expect(encoded).not.toContain('{')
    expect(encoded).not.toContain('"')
  })

  it('returns null for invalid encoded string', () => {
    expect(decodeBill('not-valid-lz')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(decodeBill('')).toBeNull()
  })
})
