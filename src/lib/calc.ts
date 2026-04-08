import {
  type Bill,
  CURRENCY_CONFIG,
  type Currency,
  type PersonTotal,
} from '../types'

export function calculateTotals(bill: Bill): PersonTotal[] {
  const { people, items, tip, serviceFee, deliveryFee } = bill

  const itemSubtotals = new Map<string, number>()
  const itemBreakdowns = new Map<string, PersonTotal['itemBreakdown']>()
  for (const person of people) {
    itemSubtotals.set(person.id, 0)
    itemBreakdowns.set(person.id, [])
  }

  for (const item of items) {
    const assignees =
      item.assignedTo.length > 0 ? item.assignedTo : people.map((p) => p.id)
    const perPerson = Math.floor(item.price / assignees.length)
    const remainder = item.price - perPerson * assignees.length

    assignees.forEach((personId, i) => {
      const amount = perPerson + (i < remainder ? 1 : 0)
      itemSubtotals.set(personId, (itemSubtotals.get(personId) ?? 0) + amount)
      itemBreakdowns
        .get(personId)
        ?.push({ itemId: item.id, name: item.name, amount })
    })
  }

  let billSubtotal = 0
  for (const v of itemSubtotals.values()) {
    billSubtotal += v
  }

  const resolveSharedCost = (cost: Bill['tip']): number => {
    if (cost.type === 'percentage')
      return Math.round((billSubtotal * cost.value) / 100)
    return cost.value
  }

  const tipTotal = resolveSharedCost(tip)
  const serviceFeeTotal = resolveSharedCost(serviceFee)
  const deliveryFeeTotal = resolveSharedCost(deliveryFee)

  const distribute = (total: number): Map<string, number> => {
    if (total === 0) {
      return new Map(people.map((p) => [p.id, 0]))
    }

    if (billSubtotal === 0) {
      const even = Math.floor(total / people.length)
      const rem = total - even * people.length
      return new Map(people.map((p, i) => [p.id, even + (i < rem ? 1 : 0)]))
    }

    const exact = people.map((p) => {
      const sub = itemSubtotals.get(p.id) ?? 0
      return (total * sub) / billSubtotal
    })
    const floors = exact.map(Math.floor)
    let rem = total - floors.reduce((a, b) => a + b, 0)

    // Largest-remainder method
    const order = floors
      .map((floor, i) => ({ i, frac: exact[i] - floor }))
      .sort((a, b) => b.frac - a.frac || a.i - b.i)

    const result = [...floors]
    for (const { i } of order) {
      if (rem <= 0) {
        break
      }
      result[i]++
      rem--
    }

    return new Map(people.map((p, i) => [p.id, result[i]]))
  }

  const tipShares = distribute(tipTotal)
  const serviceFeeShares = distribute(serviceFeeTotal)
  const deliveryFeeShares = distribute(deliveryFeeTotal)

  return people.map((person) => {
    const itemsSubtotal = itemSubtotals.get(person.id) ?? 0
    const tipShare = tipShares.get(person.id) ?? 0
    const serviceFeeShare = serviceFeeShares.get(person.id) ?? 0
    const deliveryFeeShare = deliveryFeeShares.get(person.id) ?? 0
    return {
      personId: person.id,
      name: person.name,
      itemsSubtotal,
      tipShare,
      serviceFeeShare,
      deliveryFeeShare,
      total: itemsSubtotal + tipShare + serviceFeeShare + deliveryFeeShare,
      itemBreakdown: itemBreakdowns.get(person.id) ?? [],
    }
  })
}

export function centsToDecimal(
  cents: number,
  decimalSeparator: string,
  decimals: number = 2,
): string {
  if (decimals === 0) {
    return cents.toString()
  }
  return (cents / 100).toFixed(decimals).replace('.', decimalSeparator)
}

export function parseCents(
  raw: string,
  thousandsRe: RegExp,
  decSep: string,
  decimals: number = 2,
): number | null {
  const normalised = raw.replace(thousandsRe, '').replace(decSep, '.')
  const parsed = parseFloat(normalised)
  if (!Number.isNaN(parsed) && parsed >= 0) {
    if (decimals === 0) {
      return Math.round(parsed)
    }
    return Math.round(parsed * 100)
  }
  return null
}

export function formatCents(cents: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency]
  const amount = centsToDecimal(cents, config.decimalSeparator, config.decimals)
  return config.symbolPosition === 'prefix'
    ? `${config.symbol}${amount}`
    : `${amount} ${config.symbol}`
}
