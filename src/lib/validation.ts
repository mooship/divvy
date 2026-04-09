import type { Person } from '../types'

export const MAX_PERSON_NAME_LENGTH = 30
export const MAX_ITEM_NAME_LENGTH = 60

export function isDuplicateName(name: string, people: Person[]): boolean {
  return people.some((p) => p.name.toLowerCase() === name.toLowerCase())
}

export function isValidItem(name: string, price: number): boolean {
  return Boolean(name.trim()) && price > 0
}
