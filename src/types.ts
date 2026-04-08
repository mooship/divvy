export type Currency =
  | 'AED'
  | 'AUD'
  | 'BRL'
  | 'CAD'
  | 'CHF'
  | 'CNY'
  | 'DKK'
  | 'EUR'
  | 'GBP'
  | 'HKD'
  | 'ILS'
  | 'INR'
  | 'JPY'
  | 'KRW'
  | 'MXN'
  | 'MYR'
  | 'NOK'
  | 'NZD'
  | 'PLN'
  | 'SEK'
  | 'SGD'
  | 'THB'
  | 'TRY'
  | 'USD'
  | 'ZAR'

export type OcrLanguage =
  | 'afr'
  | 'eng'
  | 'fra'
  | 'deu'
  | 'spa'
  | 'ita'
  | 'por'
  | 'nld'

export const OCR_LANGUAGES: Record<OcrLanguage, string> = {
  afr: 'Afrikaans',
  eng: 'English',
  fra: 'Français',
  deu: 'Deutsch',
  spa: 'Español',
  ita: 'Italiano',
  por: 'Português',
  nld: 'Nederlands',
}

export interface CurrencyConfig {
  name: string
  symbol: string
  symbolPosition: 'prefix' | 'suffix'
  decimalSeparator: string
  thousandsSeparator: string
  decimals: number
}

export const CURRENCY_CONFIG: Record<Currency, CurrencyConfig> = {
  AED: {
    name: 'UAE Dirham',
    symbol: 'AED',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  AUD: {
    name: 'Australian Dollar',
    symbol: 'A$',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  BRL: {
    name: 'Brazilian Real',
    symbol: 'R$',
    symbolPosition: 'prefix',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },
  CAD: {
    name: 'Canadian Dollar',
    symbol: 'CA$',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  CHF: {
    name: 'Swiss Franc',
    symbol: 'CHF',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: "'",
    decimals: 2,
  },
  CNY: {
    name: 'Chinese Yuan',
    symbol: '¥',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  DKK: {
    name: 'Danish Krone',
    symbol: 'kr',
    symbolPosition: 'suffix',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },
  EUR: {
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'prefix',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },
  GBP: {
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  HKD: {
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  ILS: {
    name: 'Israeli Shekel',
    symbol: '₪',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  INR: {
    name: 'Indian Rupee',
    symbol: '₹',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  JPY: {
    name: 'Japanese Yen',
    symbol: '¥',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 0,
  },
  KRW: {
    name: 'South Korean Won',
    symbol: '₩',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 0,
  },
  MXN: {
    name: 'Mexican Peso',
    symbol: 'MX$',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  MYR: {
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  NOK: {
    name: 'Norwegian Krone',
    symbol: 'kr',
    symbolPosition: 'suffix',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },
  NZD: {
    name: 'New Zealand Dollar',
    symbol: 'NZ$',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  PLN: {
    name: 'Polish Zloty',
    symbol: 'zł',
    symbolPosition: 'suffix',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },
  SEK: {
    name: 'Swedish Krona',
    symbol: 'kr',
    symbolPosition: 'suffix',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },
  SGD: {
    name: 'Singapore Dollar',
    symbol: 'S$',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  THB: {
    name: 'Thai Baht',
    symbol: '฿',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  TRY: {
    name: 'Turkish Lira',
    symbol: '₺',
    symbolPosition: 'prefix',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },
  USD: {
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  ZAR: {
    name: 'South African Rand',
    symbol: 'R',
    symbolPosition: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
}

export const POPULAR_CURRENCIES: Currency[] = [
  'USD',
  'EUR',
  'GBP',
  'ZAR',
  'CHF',
]

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
  value: number // percentage value (e.g. 15 for 15%, decimals allowed) or fixed in cents
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
  itemsSubtotal: number // all numeric fields below are cents
  tipShare: number
  serviceFeeShare: number
  deliveryFeeShare: number
  total: number
  itemBreakdown: Array<{ itemId: string; name: string; amount: number }>
}

export interface BillSummary {
  id: string
  date: string // ISO
  peopleCount: number
  total: number // cents
  currency: Currency
  encoded?: string // LZ-encoded bill for read-only sharing; absent on legacy entries
}
