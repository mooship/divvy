import { describe, expect, it } from 'vitest'
import { type OcrLine, parseReceiptLines } from './ocr'

const toLines = (texts: string[], confidence = 95): OcrLine[] =>
  texts.map((text) => ({ text, confidence }))

describe('parseReceiptLines', () => {
  it('extracts item name and ZAR price', () => {
    const items = parseReceiptLines(
      toLines(['Margherita Pizza    R 45.00']),
      'ZAR',
    )
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Margherita Pizza')
    expect(items[0].price).toBe(4500)
  })

  it('extracts price without currency symbol', () => {
    const items = parseReceiptLines(toLines(['Burger    12.50']), 'USD')
    expect(items).toHaveLength(1)
    expect(items[0].price).toBe(1250)
  })

  it('filters structural lines — total', () => {
    const items = parseReceiptLines(
      toLines(['Coke    R 20.00', 'TOTAL    R 20.00']),
      'ZAR',
    )
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Coke')
  })

  it('filters structural lines — subtotal, vat, tax', () => {
    const items = parseReceiptLines(
      toLines([
        'Fries    R 35.00',
        'SUBTOTAL    R 35.00',
        'VAT (15%)    R 5.25',
        'Change    R 0.00',
        'Cash    R 40.00',
      ]),
      'ZAR',
    )
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Fries')
  })

  it('strips quantity prefix 2x', () => {
    const items = parseReceiptLines(toLines(['2x Coke    R 40.00']), 'ZAR')
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Coke')
    expect(items[0].price).toBe(4000)
  })

  it('strips quantity prefix with space: 3 x Water', () => {
    const items = parseReceiptLines(toLines(['3 x Water    R 15.00']), 'ZAR')
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Water')
  })

  it('handles EUR comma decimal separator', () => {
    const items = parseReceiptLines(toLines(['Pizza    €12,50']), 'EUR')
    expect(items).toHaveLength(1)
    expect(items[0].price).toBe(1250)
  })

  it('skips lines with no extractable price', () => {
    const items = parseReceiptLines(toLines(['Thank you for visiting!']), 'ZAR')
    expect(items).toHaveLength(0)
  })

  it('skips lines where price is zero', () => {
    const items = parseReceiptLines(toLines(['Free item    R 0.00']), 'ZAR')
    expect(items).toHaveLength(0)
  })

  describe('keyword false-positive prevention', () => {
    it('does not filter "Cashew Nuts" (contains "cash")', () => {
      const items = parseReceiptLines(
        toLines(['Cashew Nuts    R 45.00']),
        'ZAR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Cashew Nuts')
    })

    it('does not filter "Tip Top Bread" (contains "tip")', () => {
      const items = parseReceiptLines(
        toLines(['Tip Top Bread    R 32.00']),
        'ZAR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Tip Top Bread')
    })

    it('does not filter "Discount Chicken" (contains "discount")', () => {
      const items = parseReceiptLines(
        toLines(['Discount Chicken    R 28.00']),
        'ZAR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Discount Chicken')
    })

    it('does not filter "Credit Crunch Cereal" (contains "credit")', () => {
      const items = parseReceiptLines(
        toLines(['Credit Crunch Cereal    R 55.00']),
        'ZAR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Credit Crunch Cereal')
    })

    it('still filters exact keyword "Cash"', () => {
      const items = parseReceiptLines(toLines(['Cash    R 200.00']), 'ZAR')
      expect(items).toHaveLength(0)
    })

    it('still filters exact keyword "Delivery"', () => {
      const items = parseReceiptLines(toLines(['Delivery    R 15.00']), 'ZAR')
      expect(items).toHaveLength(0)
    })

    it('still filters "Tip" as standalone word', () => {
      const items = parseReceiptLines(toLines(['Tip    R 10.00']), 'ZAR')
      expect(items).toHaveLength(0)
    })
  })

  describe('flexible decimal places', () => {
    it('parses price with 1 decimal place', () => {
      const items = parseReceiptLines(toLines(['Burger    12.5']), 'USD')
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(1250)
    })

    it('parses price with 3 decimal places', () => {
      const items = parseReceiptLines(toLines(['Burger    12.500']), 'USD')
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(1250)
    })

    it('still parses standard 2 decimal places', () => {
      const items = parseReceiptLines(toLines(['Burger    12.50']), 'USD')
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(1250)
    })
  })

  describe('thousands separators', () => {
    it('handles USD thousands separator', () => {
      const items = parseReceiptLines(
        toLines(['Wagyu Steak    1,234.56']),
        'USD',
      )
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(123456)
    })

    it('handles EUR thousands separator', () => {
      const items = parseReceiptLines(
        toLines(['Wagyu Steak    1.234,56']),
        'EUR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(123456)
    })

    it('handles ZAR thousands separator', () => {
      const items = parseReceiptLines(
        toLines(['Champagne    R 2,500.00']),
        'ZAR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(250000)
    })

    it('handles CHF apostrophe thousands separator', () => {
      const items = parseReceiptLines(
        toLines(["Wagyu Steak    CHF 1'234.56"]),
        'CHF',
      )
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(123456)
    })
  })

  describe('CHF currency', () => {
    it('parses CHF price with symbol', () => {
      const items = parseReceiptLines(toLines(['Rösti    CHF 18.50']), 'CHF')
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Rösti')
      expect(items[0].price).toBe(1850)
    })
  })

  describe('GBP currency', () => {
    it('parses GBP price with symbol', () => {
      const items = parseReceiptLines(
        toLines(['Fish & Chips    £12.50']),
        'GBP',
      )
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(1250)
    })

    it('parses small GBP price', () => {
      const items = parseReceiptLines(toLines(['Scone    £3.50']), 'GBP')
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(350)
    })
  })

  describe('quantity prefix with multiplication sign', () => {
    it('handles Unicode multiplication sign ×', () => {
      const items = parseReceiptLines(
        toLines(['2\u00d7 Coke    R 40.00']),
        'ZAR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Coke')
    })

    it('handles × with no space before name but space after', () => {
      const items = parseReceiptLines(
        toLines(['3\u00d7 Water    R 15.00']),
        'ZAR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Water')
    })
  })

  describe('confidence scores', () => {
    it('propagates line confidence to parsed items', () => {
      const items = parseReceiptLines(
        [{ text: 'Burger    12.50', confidence: 72 }],
        'USD',
      )
      expect(items).toHaveLength(1)
      expect(items[0].confidence).toBe(72)
    })

    it('applies 50% penalty for short names (1-2 chars)', () => {
      const items = parseReceiptLines(
        [{ text: 'AB    12.50', confidence: 90 }],
        'USD',
      )
      expect(items).toHaveLength(1)
      expect(items[0].confidence).toBe(45)
    })

    it('does not penalize names with 3+ characters', () => {
      const items = parseReceiptLines(
        [{ text: 'Pie    12.50', confidence: 90 }],
        'USD',
      )
      expect(items).toHaveLength(1)
      expect(items[0].confidence).toBe(90)
    })
  })

  describe('edge cases', () => {
    it('skips line with only a price and no name', () => {
      const items = parseReceiptLines(toLines(['R 45.00']), 'ZAR')
      expect(items).toHaveLength(0)
    })

    it('handles price with currency symbol but no space', () => {
      const items = parseReceiptLines(toLines(['Burger    R45.00']), 'ZAR')
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(4500)
    })

    it('handles very long item name', () => {
      const longName = 'A'.repeat(60)
      const items = parseReceiptLines(
        toLines([`${longName}    R 10.00`]),
        'ZAR',
      )
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe(longName)
    })

    it('skips empty lines', () => {
      const items = parseReceiptLines(
        toLines(['', '   ', 'Coke    R 20.00']),
        'ZAR',
      )
      expect(items).toHaveLength(1)
    })
  })
})
