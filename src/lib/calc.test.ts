import { describe, expect, it } from 'vitest'
import type { Bill } from '../types'
import { calculateTotals, formatCents } from './calc'

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
  tax: { type: 'percentage', value: 0 },
  discount: { type: 'fixed', value: 0 },
  ...overrides,
})

describe('calculateTotals', () => {
  it('assigns item solely to one person', () => {
    const bill = makeBill({
      items: [{ id: 'i1', name: 'Pizza', price: 2000, assignedTo: ['alice'] }],
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
    expect(alice.itemsSubtotal).toBe(2000)
    expect(bob.itemsSubtotal).toBe(0)
  })

  it('splits item equally between two people', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'Shared', price: 1000, assignedTo: ['alice', 'bob'] },
      ],
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
    expect(alice.itemsSubtotal).toBe(500)
    expect(bob.itemsSubtotal).toBe(500)
    expect(alice.itemsSubtotal + bob.itemsSubtotal).toBe(1000)
  })

  it('assigns odd-cent remainder to first person in assignedTo', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'Odd', price: 101, assignedTo: ['alice', 'bob'] },
      ],
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
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
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
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
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
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
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
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

  it('distributes tip remainder by largest fractional part, not position', () => {
    // Alice: 2¢, Bob: 1¢ subtotals → Alice's exact tip share has larger fraction
    // distributing a 10¢ tip: Alice = floor(10*2/3)=6 + 1 remainder = 7, Bob = 3
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'A', price: 2, assignedTo: ['alice'] },
        { id: 'i2', name: 'B', price: 1, assignedTo: ['bob'] },
      ],
      tip: { type: 'fixed', value: 10 },
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
    // exact: alice = 10*2/3 = 6.667, bob = 10*1/3 = 3.333
    // floors: alice=6, bob=3 → allocated=9, rem=1
    // alice has larger frac (0.667 > 0.333) → alice gets the extra cent
    expect(alice.tipShare).toBe(7)
    expect(bob.tipShare).toBe(3)
    expect(alice.tipShare + bob.tipShare).toBe(10)
  })

  it('ignores assignedTo entries that reference non-existent people', () => {
    const bill = makeBill({
      items: [
        {
          id: 'i1',
          name: 'Pizza',
          price: 1000,
          assignedTo: ['alice', 'ghost'],
        },
      ],
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // 'ghost' is not in people, but still in assignedTo so price is split 2 ways
    expect(alice.itemsSubtotal).toBe(500)
    expect(alice.total).toBe(500)
  })

  it('distributes percentage tax proportionally', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'Big', price: 6000, assignedTo: ['alice'] },
        { id: 'i2', name: 'Small', price: 2000, assignedTo: ['bob'] },
      ],
      tax: { type: 'percentage', value: 10 },
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
    expect(alice.taxShare).toBe(600)
    expect(bob.taxShare).toBe(200)
    expect(alice.total).toBe(6600)
    expect(bob.total).toBe(2200)
  })

  it('distributes fixed tax proportionally', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'A', price: 3000, assignedTo: ['alice'] },
        { id: 'i2', name: 'B', price: 1000, assignedTo: ['bob'] },
      ],
      tax: { type: 'fixed', value: 400 },
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
    expect(alice.taxShare).toBe(300)
    expect(bob.taxShare).toBe(100)
  })

  it('subtracts discount from totals proportionally', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'A', price: 6000, assignedTo: ['alice'] },
        { id: 'i2', name: 'B', price: 2000, assignedTo: ['bob'] },
      ],
      discount: { type: 'fixed', value: 800 },
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
    expect(alice.discountShare).toBe(600)
    expect(bob.discountShare).toBe(200)
    expect(alice.total).toBe(5400) // 6000 - 600
    expect(bob.total).toBe(1800) // 2000 - 200
  })

  it('subtracts percentage discount from totals', () => {
    const bill = makeBill({
      items: [
        { id: 'i1', name: 'A', price: 5000, assignedTo: ['alice'] },
        { id: 'i2', name: 'B', price: 5000, assignedTo: ['bob'] },
      ],
      discount: { type: 'percentage', value: 20 },
    })
    const totals = calculateTotals(bill)
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const alice = totals.find((t) => t.personId === 'alice')!
    // biome-ignore lint/style/noNonNullAssertion: test assertion — person is guaranteed to exist
    const bob = totals.find((t) => t.personId === 'bob')!
    expect(alice.discountShare).toBe(1000)
    expect(bob.discountShare).toBe(1000)
    expect(alice.total).toBe(4000)
    expect(bob.total).toBe(4000)
  })

  it('applies tax and discount together correctly', () => {
    const bill = makeBill({
      items: [
        {
          id: 'i1',
          name: 'Dinner',
          price: 10000,
          assignedTo: ['alice', 'bob'],
        },
      ],
      tax: { type: 'percentage', value: 10 },
      discount: { type: 'fixed', value: 1000 },
    })
    const totals = calculateTotals(bill)
    const grand = totals.reduce((s, t) => s + t.total, 0)
    // subtotal: 10000, tax: 1000, discount: -1000 → grand: 10000
    expect(grand).toBe(10000)
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

  it('formats CHF with prefix symbol', () => {
    expect(formatCents(1850, 'CHF')).toBe('CHF18.50')
  })

  it('formats JPY with no decimals (zero-decimal currency)', () => {
    expect(formatCents(1250, 'JPY')).toBe('¥1250')
  })

  it('formats KRW with no decimals (zero-decimal currency)', () => {
    expect(formatCents(5000, 'KRW')).toBe('₩5000')
  })

  it('formats suffix currency (SEK)', () => {
    expect(formatCents(1250, 'SEK')).toBe('12,50 kr')
  })

  it('formats suffix currency (PLN)', () => {
    expect(formatCents(9999, 'PLN')).toBe('99,99 zł')
  })

  it('formats AUD with prefix symbol', () => {
    expect(formatCents(2500, 'AUD')).toBe('A$25.00')
  })
})
