import LZString from 'lz-string'
import type { Bill } from '../types'

export function encodeBill(bill: Bill): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(bill))
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
    return JSON.parse(json) as Bill
  } catch {
    return null
  }
}
