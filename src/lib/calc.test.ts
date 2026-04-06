import { describe, it, expect } from 'vitest'
import { calculateTotals, formatCents } from './calc'
import type { Bill } from '../types'

const makeBill = (overrides: Partial<Bill> = {}): Bill => ({
  id: '1',
  currency: 'USD',
  people: [
    { id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' },
  ],
  items: [],
  tip: { type: 'percentage', value: 0 },
  serviceFee: { type: 'fixed', value: 0 },
  deliveryFee: { type: 'fixed', value: 0 },
  ...overrides,
})

describe('calculateTotals', () => {
  it('assigns item solely to one person', () => {
    const bill = makeBill({
      items: [{ id: 'i1', name: 'Pizza', price: 2000, assignedTo: ['alice'] }],
    })
    const totals = calculateTotals(bill)
    const alice = totals.find(t => t.personId === 'alice')!
    const bob = totals.find(t => t.personId === 'bob')!
    expect(alice.itemsSubtotal).toBe(2000)
    expect(bob.itemsSubtotal).toBe(0)
  })

  it('splits item equally between two people', () => {
    const bill = makeBill({
      items: [{ id: 'i1', name: 'Shared', price: 1000, assignedTo: ['alice', 'bob'] }],
    })
    const totals = calculateTotals(bill)
    const alice = totals.find(t => t.personId === 'alice')!
    const bob = totals.find(t => t.personId === 'bob')!
    expect(alice.itemsSubtotal).toBe(500)
    expect(bob.itemsSubtotal).toBe(500)
    expect(alice.itemsSubtotal + bob.itemsSubtotal).toBe(1000)
  })

  it('assigns odd-cent remainder to first person in assignedTo', () => {
    const bill = makeBill({
      items: [{ id: 'i1', name: 'Odd', price: 101, assignedTo: ['alice', 'bob'] }],
    })
    const totals = calculateTotals(bill)
    const alice = totals.find(t => t.personId === 'alice')!
    const bob = totals.find(t => t.personId === 'bob')!
    expect(alice.itemsSubtotal).toBe(51)
    expect(bob.itemsSubtotal).toBe(50)
  })

  it('distributes percentage tip proportionally', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'Big', price: 6000, assignedTo: ['alice'] },
        { id: 'i2', name: 'Small', price: 2000, assignedTo: ['bob'] },
      ],
      tip: { type: 'percentage', value: 10 },
    })
    const totals = calculateTotals(bill)
    const alice = totals.find(t => t.personId === 'alice')!
    const bob = totals.find(t => t.personId === 'bob')!
    expect(alice.tipShare).toBe(600)
    expect(bob.tipShare).toBe(200)
    expect(alice.tipShare + bob.tipShare).toBe(800)
  })

  it('distributes fixed tip proportionally', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'Big', price: 6000, assignedTo: ['alice'] },
        { id: 'i2', name: 'Small', price: 2000, assignedTo: ['bob'] },
      ],
      tip: { type: 'fixed', value: 800 },
    })
    const totals = calculateTotals(bill)
    const alice = totals.find(t => t.personId === 'alice')!
    const bob = totals.find(t => t.personId === 'bob')!
    expect(alice.tipShare).toBe(600)
    expect(bob.tipShare).toBe(200)
  })

  it('total per person equals itemsSubtotal + all shares', () => {
    const bill = makeBill({
      items: [{ id: 'i1', name: 'Pizza', price: 1000, assignedTo: ['alice'] }],
      tip: { type: 'fixed', value: 100 },
      deliveryFee: { type: 'fixed', value: 200 },
    })
    const totals = calculateTotals(bill)
    const alice = totals.find(t => t.personId === 'alice')!
    expect(alice.total).toBe(1300)
  })

  it('grand total matches sum of all items + shared costs', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'A', price: 3000, assignedTo: ['alice'] },
        { id: 'i2', name: 'B', price: 2000, assignedTo: ['bob'] },
      ],
      tip: { type: 'percentage', value: 10 },
    })
    const totals = calculateTotals(bill)
    const grand = totals.reduce((s, t) => s + t.total, 0)
    expect(grand).toBe(5500)
  })
})

describe('formatCents', () => {
  it('formats USD with prefix symbol', () => {
    expect(formatCents(1250, 'USD')).toBe('$12.50')
  })

  it('formats ZAR with prefix symbol', () => {
    expect(formatCents(4500, 'ZAR')).toBe('R45.00')
  })

  it('formats EUR with comma decimal', () => {
    expect(formatCents(1250, 'EUR')).toBe('€12,50')
  })
})
