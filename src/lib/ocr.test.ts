// src/lib/ocr.test.ts
import { describe, expect, it } from 'vitest'
import { parseReceiptLines } from './ocr'

describe('parseReceiptLines', () => {
  it('extracts item name and ZAR price', () => {
    const items = parseReceiptLines(['Margherita Pizza    R 45.00'], 'ZAR')
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Margherita Pizza')
    expect(items[0].price).toBe(4500)
  })

  it('extracts price without currency symbol', () => {
    const items = parseReceiptLines(['Burger    12.50'], 'USD')
    expect(items).toHaveLength(1)
    expect(items[0].price).toBe(1250)
  })

  it('filters structural lines — total', () => {
    const items = parseReceiptLines(
      ['Coke    R 20.00', 'TOTAL    R 20.00'],
      'ZAR',
    )
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Coke')
  })

  it('filters structural lines — subtotal, vat, tax', () => {
    const items = parseReceiptLines(
      [
        'Fries    R 35.00',
        'SUBTOTAL    R 35.00',
        'VAT (15%)    R 5.25',
        'Change    R 0.00',
        'Cash    R 40.00',
      ],
      'ZAR',
    )
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Fries')
  })

  it('strips quantity prefix 2x', () => {
    const items = parseReceiptLines(['2x Coke    R 40.00'], 'ZAR')
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Coke')
    expect(items[0].price).toBe(4000)
  })

  it('strips quantity prefix with space: 3 x Water', () => {
    const items = parseReceiptLines(['3 x Water    R 15.00'], 'ZAR')
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Water')
  })

  it('handles EUR comma decimal separator', () => {
    const items = parseReceiptLines(['Pizza    €12,50'], 'EUR')
    expect(items).toHaveLength(1)
    expect(items[0].price).toBe(1250)
  })

  it('skips lines with no extractable price', () => {
    const items = parseReceiptLines(['Thank you for visiting!'], 'ZAR')
    expect(items).toHaveLength(0)
  })

  it('skips lines where price is zero', () => {
    const items = parseReceiptLines(['Free item    R 0.00'], 'ZAR')
    expect(items).toHaveLength(0)
  })
})
