import { create } from 'zustand'
import type { OcrLine } from '../lib/ocr'
import type { Currency } from '../types'

export type OcrStatus = 'idle' | 'processing' | 'done' | 'error'

export interface OcrCandidate {
  name: string
  price: number // cents
  confidence: number
  selected: boolean
}

interface OcrState {
  status: OcrStatus
  progress: number // 0–100
  candidates: OcrCandidate[]
  rawLines: OcrLine[]
  detectedCurrency: Currency | null
}

interface OcrActions {
  setStatus: (status: OcrStatus) => void
  setProgress: (progress: number) => void
  setCandidates: (candidates: OcrCandidate[]) => void
  setRawLines: (lines: OcrLine[]) => void
  toggleCandidate: (index: number) => void
  setDetectedCurrency: (currency: Currency | null) => void
  clearOcr: () => void
}

export const useOcrStore = create<OcrState & OcrActions>()((set) => ({
  status: 'idle',
  progress: 0,
  candidates: [],
  rawLines: [],
  detectedCurrency: null,
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setCandidates: (candidates) => set({ candidates }),
  setRawLines: (lines) => set({ rawLines: lines }),
  toggleCandidate: (index) =>
    set((s) => ({
      candidates: s.candidates.map((c, i) =>
        i === index ? { ...c, selected: !c.selected } : c,
      ),
    })),
  setDetectedCurrency: (currency) => set({ detectedCurrency: currency }),
  clearOcr: () =>
    set({
      status: 'idle',
      progress: 0,
      candidates: [],
      rawLines: [],
      detectedCurrency: null,
    }),
}))
