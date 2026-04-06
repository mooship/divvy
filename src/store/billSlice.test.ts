import { beforeEach, describe, expect, it } from 'vitest'
import { getRecentBills, useBillStore } from './billSlice'

const EMPTY_BILL = {
  id: '',
  currency: 'ZAR' as const,
  people: [],
  items: [],
  tip: { type: 'percentage' as const, value: 0 },
  serviceFee: { type: 'fixed' as const, value: 0 },
  deliveryFee: { type: 'fixed' as const, value: 0 },
}

beforeEach(() => {
  useBillStore.setState(EMPTY_BILL)
  localStorage.clear()
})

describe('billStore', () => {
  it('addPerson appends a person with a unique id', () => {
    useBillStore.getState().addPerson('Alice')
    const { people } = useBillStore.getState()
    expect(people).toHaveLength(1)
    expect(people[0].name).toBe('Alice')
    expect(people[0].id).toBeTruthy()
  })

  it('removePerson removes the person and clears them from item assignments', () => {
    const { addPerson, addItem, assignItem, removePerson } =
      useBillStore.getState()
    addPerson('Alice')
    addPerson('Bob')
    const { people } = useBillStore.getState()
    const [alice, bob] = people
    addItem('Pizza', 2000)
    const item = useBillStore.getState().items[0]
    assignItem(item.id, [alice.id, bob.id])
    removePerson(alice.id)
    const updatedItem = useBillStore.getState().items[0]
    expect(
      useBillStore.getState().people.find((p) => p.id === alice.id),
    ).toBeUndefined()
    expect(updatedItem.assignedTo).not.toContain(alice.id)
    expect(updatedItem.assignedTo).toContain(bob.id)
  })

  it('addItem appends an item with empty assignedTo', () => {
    useBillStore.getState().addItem('Burger', 1500)
    const { items } = useBillStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Burger')
    expect(items[0].price).toBe(1500)
    expect(items[0].assignedTo).toEqual([])
  })

  it('removeItem deletes the item', () => {
    useBillStore.getState().addItem('Burger', 1500)
    const itemId = useBillStore.getState().items[0].id
    useBillStore.getState().removeItem(itemId)
    expect(useBillStore.getState().items).toHaveLength(0)
  })

  it('assignItem sets assignedTo on the item', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Pizza', 2000)
    const { people, items } = useBillStore.getState()
    useBillStore.getState().assignItem(items[0].id, [people[0].id])
    expect(useBillStore.getState().items[0].assignedTo).toEqual([people[0].id])
  })

  it('reset creates a new bill id and clears state', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().reset()
    const state = useBillStore.getState()
    expect(state.people).toHaveLength(0)
    expect(state.id).toBeTruthy()
  })
})

describe('getRecentBills', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(getRecentBills()).toEqual([])
  })

  it('returns empty array when localStorage contains corrupt JSON', () => {
    localStorage.setItem('divvy-recent-bills', 'not-valid-json{{{{')
    expect(getRecentBills()).toEqual([])
  })

  it('saves a summary with encoded field on reset', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    useBillStore.getState().addItem('Pizza', 2000)
    useBillStore.setState({ id: 'test-bill-id' })
    useBillStore.getState().reset()
    const recent = getRecentBills()
    expect(recent).toHaveLength(1)
    expect(recent[0].id).toBe('test-bill-id')
    expect(typeof recent[0].encoded).toBe('string')
    expect(recent[0].encoded?.length).toBeGreaterThan(0)
  })
})
