import { CURRENCY_CONFIG, type Currency, type OcrLanguage } from '../types'

// Keywords safe to match as whole words anywhere in the name
const KEYWORD_PATTERNS = [
  'total',
  'subtotal',
  'sub-total',
  'sub total',
  'vat',
  'tax',
  'gst',
  'hst',
  'pst',
  'amount due',
  'visa',
  'mastercard',
  'amex',
  'gratuity',
  'service charge',
  'thank you',
]

// Ambiguous keywords that only filter when they ARE the entire name
const EXACT_KEYWORDS = [
  'tip',
  'cash',
  'credit',
  'debit',
  'card',
  'change',
  'balance',
  'delivery',
  'receipt',
  'invoice',
  'discount',
  'coupon',
  'promo',
]

const KEYWORD_RE = new RegExp(`\\b(${KEYWORD_PATTERNS.join('|')})\\b`, 'i')
const EXACT_RE = new RegExp(`^(${EXACT_KEYWORDS.join('|')})$`, 'i')

export interface OcrLine {
  text: string
  confidence: number
}

export interface ParsedItem {
  name: string
  price: number
  confidence: number
}

export function parseReceiptLines(
  lines: OcrLine[],
  currency: Currency = 'ZAR',
): ParsedItem[] {
  const config = CURRENCY_CONFIG[currency]
  const results: ParsedItem[] = []

  const dec = config.decimalSeparator === '.' ? '\\.' : ','
  const thou =
    config.thousandsSeparator === '.' ? '\\.' : config.thousandsSeparator
  const sym = config.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const priceRegex = new RegExp(
    `(?:${sym}\\s*)?(\\d{1,3}(?:${thou}\\d{3})*${dec}\\d{1,3})\\s*$`,
  )

  for (const line of lines) {
    const trimmed = line.text.trim()
    if (!trimmed) {
      continue
    }

    const match = trimmed.match(priceRegex)
    if (!match || match.index === undefined) {
      continue
    }

    const priceStr = match[1]
      .replaceAll(config.thousandsSeparator, '')
      .replace(config.decimalSeparator, '.')
    const price = Math.round(parseFloat(priceStr) * 100)
    if (Number.isNaN(price) || price <= 0) {
      continue
    }

    let name = trimmed.slice(0, match.index).trim()

    if (KEYWORD_RE.test(name) || EXACT_RE.test(name)) {
      continue
    }

    const qtyMatch = name.match(/^(\d+)\s*[x\u00d7]\s+/i)
    if (qtyMatch) {
      name = name.slice(qtyMatch[0].length).trim()
    }

    if (!name) {
      continue
    }

    let confidence = line.confidence
    if (name.length <= 2) {
      confidence = Math.round(confidence * 0.5)
    }

    results.push({ name, price, confidence })
  }

  return results
}

export function preprocessImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      const MAX_WIDTH = 2000
      const MIN_WIDTH = 800
      let { width, height } = img

      if (width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width))
        width = MAX_WIDTH
      } else if (width < MIN_WIDTH && width > 0) {
        height = Math.round(height * (MIN_WIDTH / width))
        width = MIN_WIDTH
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to get 2d canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const { data } = imageData

      // First pass: convert to grayscale and build histogram for Otsu's method
      const histogram = new Uint32Array(256)
      const greyValues = new Uint8Array(data.length / 4)
      for (let i = 0; i < data.length; i += 4) {
        const grey = Math.round(
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2],
        )
        greyValues[i / 4] = grey
        histogram[grey]++
      }

      // Otsu's method: find optimal threshold
      const totalPixels = data.length / 4
      let sumAll = 0
      for (let i = 0; i < 256; i++) {
        sumAll += i * histogram[i]
      }

      let sumBg = 0
      let weightBg = 0
      let maxVariance = 0
      let threshold = 128

      for (let t = 0; t < 256; t++) {
        weightBg += histogram[t]
        if (weightBg === 0) {
          continue
        }
        const weightFg = totalPixels - weightBg
        if (weightFg === 0) {
          break
        }
        sumBg += t * histogram[t]
        const meanBg = sumBg / weightBg
        const meanFg = (sumAll - sumBg) / weightFg
        const variance = weightBg * weightFg * (meanBg - meanFg) ** 2
        if (variance > maxVariance) {
          maxVariance = variance
          threshold = t
        }
      }

      // Second pass: binarize using Otsu threshold
      for (let i = 0; i < greyValues.length; i++) {
        const binary = greyValues[i] > threshold ? 255 : 0
        const idx = i * 4
        data[idx] = data[idx + 1] = data[idx + 2] = binary
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
  language: OcrLanguage
  progressCallback: ((pct: number) => void) | null
}

let _workerState: WorkerState | null = null

export async function runOcr(
  imageDataUrl: string,
  onProgress: (pct: number) => void,
  language: OcrLanguage = 'eng',
): Promise<OcrLine[]> {
  if (_workerState && _workerState.language !== language) {
    await _workerState.worker.reinitialize(language)
    _workerState.language = language
  }

  if (!_workerState) {
    const { createWorker } = await import('tesseract.js')
    const state: WorkerState = {
      worker: null as never,
      language,
      progressCallback: null,
    }
    state.worker = await createWorker(language, 1, {
      logger: (m) => {
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

  const lines: OcrLine[] = []
  for (const block of result.data.blocks ?? []) {
    for (const paragraph of block.paragraphs) {
      for (const line of paragraph.lines) {
        lines.push({
          text: line.text.trim(),
          confidence:
            line.words.length > 0
              ? Math.round(
                  line.words.reduce((sum, w) => sum + w.confidence, 0) /
                    line.words.length,
                )
              : 0,
        })
      }
    }
  }
  return lines
}

export async function terminateOcr(): Promise<void> {
  if (_workerState) {
    await _workerState.worker.terminate()
    _workerState = null
  }
}
