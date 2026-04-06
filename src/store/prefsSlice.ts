import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency, OcrLanguage } from '../types'

interface PrefsState {
  defaultCurrency: Currency
  ocrLanguage: OcrLanguage
}

interface PrefsActions {
  setDefaultCurrency: (currency: Currency) => void
  setOcrLanguage: (language: OcrLanguage) => void
}

export const usePrefsStore = create<PrefsState & PrefsActions>()(
  persist(
    (set) => ({
      defaultCurrency: 'ZAR' as Currency,
      ocrLanguage: 'eng' as OcrLanguage,
      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
      setOcrLanguage: (language) => set({ ocrLanguage: language }),
    }),
    { name: 'divvy-prefs' },
  ),
)
