import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency } from '../types'

interface PrefsState {
  defaultCurrency: Currency
}

interface PrefsActions {
  setDefaultCurrency: (currency: Currency) => void
}

export const usePrefsStore = create<PrefsState & PrefsActions>()(
  persist(
    set => ({
      defaultCurrency: 'ZAR' as Currency,
      setDefaultCurrency: currency => set({ defaultCurrency: currency }),
    }),
    { name: 'divvy-prefs' },
  ),
)
