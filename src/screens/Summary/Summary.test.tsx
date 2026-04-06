// src/screens/Summary/Summary.test.tsx

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useBillStore } from '../../store'
import { Summary } from '.'

const BILL_STATE = {
  id: 'test-id',
  currency: 'USD' as const,
  people: [
    { id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' },
  ],
  items: [
    { id: 'i1', name: 'Pizza', price: 2000, assignedTo: ['alice'] },
    { id: 'i2', name: 'Coke', price: 1000, assignedTo: ['bob'] },
  ],
  tip: { type: 'percentage' as const, value: 0 },
  serviceFee: { type: 'fixed' as const, value: 0 },
  deliveryFee: { type: 'fixed' as const, value: 0 },
}

beforeEach(() => {
  useBillStore.setState(BILL_STATE)
  localStorage.clear()
})

describe('Summary', () => {
  it('renders a card for each person', () => {
    render(
      <MemoryRouter>
        <Summary />
      </MemoryRouter>,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows the correct total for each person', () => {
    render(
      <MemoryRouter>
        <Summary />
      </MemoryRouter>,
    )
    expect(screen.getByText('$20.00')).toBeInTheDocument()
    expect(screen.getByText('$10.00')).toBeInTheDocument()
  })

  it('shows the grand total', () => {
    render(
      <MemoryRouter>
        <Summary />
      </MemoryRouter>,
    )
    expect(screen.getByText('$30.00')).toBeInTheDocument()
  })

  it('shows a Share button', () => {
    render(
      <MemoryRouter>
        <Summary />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })
})
