import type { Person } from '../types'

export function isDuplicateName(name: string, people: Person[]): boolean {
  return people.some((p) => p.name.toLowerCase() === name.toLowerCase())
}

export function isValidItem(name: string, price: number): boolean {
  return Boolean(name.trim()) && price > 0
}
