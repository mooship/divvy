export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP'

export const CURRENCY_CONFIG: Record<
  Currency,
  {
    symbol: string
    symbolPosition: 'prefix' | 'suffix'
    decimalSeparator: string
    thousandsSeparator: string
  }
> = {
  ZAR: {
    symbol: 'R',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  USD: {
    symbol: '$',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  EUR: {
    symbol: '€',
    symbolPosition: 'prefix',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  GBP: {
    symbol: '£',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
}

export const PERSON_COLORS = [
  '#FFCBA4', // peach
  '#C4B0FF', // lavender
  '#B8F0D2', // mint
  '#FFF3A3', // butter
  '#FFB3C6', // blush
  '#B3DFFF', // sky
  '#C1E8B0', // sage
  '#FFD0A0', // apricot
] as const

export interface Person {
  id: string
  name: string
}

export interface Item {
  id: string
  name: string
  price: number // integer cents — never float
  assignedTo: string[] // Person IDs; >1 means split equally
}

export interface SharedCost {
  type: 'percentage' | 'fixed'
  value: number // percentage as integer (e.g. 15) or fixed in cents
}

export interface Bill {
  id: string
  currency: Currency
  people: Person[]
  items: Item[]
  tip: SharedCost
  serviceFee: SharedCost
  deliveryFee: SharedCost
}

export interface PersonTotal {
  personId: string
  name: string
  itemsSubtotal: number // cents
  tipShare: number // cents
  serviceFeeShare: number // cents
  deliveryFeeShare: number // cents
  total: number // cents
  itemBreakdown: Array<{ itemId: string; name: string; amount: number }>
}

export interface BillSummary {
  id: string
  date: string // ISO
  peopleCount: number
  total: number // cents
  currency: Currency
}
