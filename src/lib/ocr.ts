import { CURRENCY_CONFIG, type Currency } from '../types'

const STRUCTURAL_KEYWORDS = [
  'total', 'subtotal', 'sub-total', 'sub total',
  'vat', 'tax', 'gst', 'hst', 'pst',
  'change', 'balance', 'amount due',
  'cash', 'card', 'visa', 'mastercard', 'amex', 'credit', 'debit',
  'tip', 'gratuity', 'service charge',
  'delivery', 'thank you', 'receipt', 'invoice',
  'discount', 'coupon', 'promo',
]

export interface ParsedItem {
  name: string
  price: number
  confidence: number
}

export function parseReceiptLines(
  lines: string[],
  currency: Currency = 'ZAR',
): ParsedItem[] {
  const config = CURRENCY_CONFIG[currency]
  const results: ParsedItem[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }

    const dec = config.decimalSeparator === '.' ? '\\.' : ','
    const sym = config.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const priceRegex = new RegExp(
      `(?:${sym}\\s*)?(\\d{1,6}${dec}\\d{2})\\s*$`,
    )

    const match = trimmed.match(priceRegex)
    if (!match || match.index === undefined) {
      continue
    }

    const priceStr = match[1].replace(config.decimalSeparator, '.')
    const price = Math.round(parseFloat(priceStr) * 100)
    if (isNaN(price) || price <= 0) {
      continue
    }

    let name = trimmed.slice(0, match.index).trim()

    const lower = name.toLowerCase()
    if (STRUCTURAL_KEYWORDS.some(kw => lower.includes(kw))) {
      continue
    }

    const qtyMatch = name.match(/^(\d+)\s*x\s+/i)
    if (qtyMatch) {
      name = name.slice(qtyMatch[0].length).trim()
    }

    if (!name) {
      continue
    }

    results.push({ name, price, confidence: 100 })
  }

  return results
}

export function preprocessImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const { data } = imageData
      for (let i = 0; i < data.length; i += 4) {
        const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        const binary = grey > 128 ? 255 : 0
        data[i] = data[i + 1] = data[i + 2] = binary
      }
      ctx.putImageData(imageData, 0, 0)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for preprocessing'))
    }

    img.src = url
  })
}

interface WorkerState {
  worker: import('tesseract.js').Worker
  progressCallback: ((pct: number) => void) | null
}

let _workerState: WorkerState | null = null

export async function runOcr(
  imageDataUrl: string,
  onProgress: (pct: number) => void,
): Promise<string> {
  if (!_workerState) {
    const { createWorker } = await import('tesseract.js')
    const state: WorkerState = { worker: null as never, progressCallback: null }
    state.worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text' && state.progressCallback) {
          state.progressCallback(Math.round(10 + m.progress * 80))
        }
      },
    })
    _workerState = state
  }

  _workerState.progressCallback = onProgress
  const result = await _workerState.worker.recognize(imageDataUrl)
  _workerState.progressCallback = null
  return result.data.text
}
