import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useBillStore } from '../../store'
import { Items } from '.'

const BASE_STATE = {
  id: 'test-id',
  currency: 'ZAR' as const,
  people: [
    { id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' },
  ],
  items: [],
  tip: { type: 'percentage' as const, value: 0 },
  serviceFee: { type: 'fixed' as const, value: 0 },
  deliveryFee: { type: 'fixed' as const, value: 0 },
  tax: { type: 'percentage' as const, value: 0 },
  discount: { type: 'fixed' as const, value: 0 },
}

beforeEach(() => {
  useBillStore.setState(BASE_STATE)
  localStorage.clear()
})

describe('Items', () => {
  it('shows empty state message when no items', () => {
    render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    )
    expect(screen.getByText(/no items yet/i)).toBeInTheDocument()
  })

  it('shows item in list after it is added via store', () => {
    useBillStore.setState({
      ...BASE_STATE,
      items: [{ id: 'i1', name: 'Pizza', price: 4500, assignedTo: [] }],
    })
    render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    )
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })

  it('Next button is disabled with no items', () => {
    render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('Next button is enabled with at least one item', () => {
    useBillStore.setState({
      ...BASE_STATE,
      items: [{ id: 'i1', name: 'Pizza', price: 4500, assignedTo: [] }],
    })
    render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })
})
