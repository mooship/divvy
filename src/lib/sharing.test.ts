import LZString from 'lz-string'
import { describe, expect, it } from 'vitest'
import type { Bill } from '../types'
import { decodeBill, encodeBill } from './sharing'

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

  it('returns null for valid JSON that is not a bill (missing fields)', () => {
    const encoded = LZString.compressToEncodedURIComponent(
      JSON.stringify({ foo: 'bar' }),
    )
    expect(decodeBill(encoded)).toBeNull()
  })

  it('returns null when currency is not a recognised value', () => {
    const bad = { ...bill, currency: 'XYZ' }
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(bad))
    expect(decodeBill(encoded)).toBeNull()
  })

  it('returns null when an item has a negative price', () => {
    const bad = {
      ...bill,
      items: [{ id: 'i1', name: 'Pizza', price: -100, assignedTo: [] }],
    }
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(bad))
    expect(decodeBill(encoded)).toBeNull()
  })

  it('returns null when an item has a float price', () => {
    const bad = {
      ...bill,
      items: [{ id: 'i1', name: 'Pizza', price: 10.5, assignedTo: [] }],
    }
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(bad))
    expect(decodeBill(encoded)).toBeNull()
  })

  it('returns null when a shared cost has an invalid type', () => {
    const bad = { ...bill, tip: { type: 'flat', value: 10 } }
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(bad))
    expect(decodeBill(encoded)).toBeNull()
  })

  it('returns null when people array contains a non-object entry', () => {
    const bad = { ...bill, people: ['alice'] }
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(bad))
    expect(decodeBill(encoded)).toBeNull()
  })

  it('round-trips a bill with a newly added currency (JPY)', () => {
    const jpyBill: Bill = {
      ...bill,
      currency: 'JPY',
      items: [{ id: 'i1', name: 'Ramen', price: 850, assignedTo: ['alice'] }],
    }
    const encoded = encodeBill(jpyBill)
    const decoded = decodeBill(encoded)
    expect(decoded).toEqual(jpyBill)
  })

  it('round-trips a bill with AUD currency', () => {
    const audBill: Bill = { ...bill, currency: 'AUD' }
    const decoded = decodeBill(encodeBill(audBill))
    expect(decoded).toEqual(audBill)
  })
})
