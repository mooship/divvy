import { create } from 'zustand'

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
}

interface OcrActions {
  setStatus: (status: OcrStatus) => void
  setProgress: (progress: number) => void
  setCandidates: (candidates: OcrCandidate[]) => void
  toggleCandidate: (index: number) => void
  clearOcr: () => void
}

export const useOcrStore = create<OcrState & OcrActions>()((set) => ({
  status: 'idle',
  progress: 0,
  candidates: [],
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setCandidates: (candidates) => set({ candidates }),
  toggleCandidate: (index) =>
    set((s) => ({
      candidates: s.candidates.map((c, i) =>
        i === index ? { ...c, selected: !c.selected } : c,
      ),
    })),
  clearOcr: () => set({ status: 'idle', progress: 0, candidates: [] }),
}))
