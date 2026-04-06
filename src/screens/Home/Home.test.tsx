// src/screens/Home/Home.test.tsx

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useBillStore } from '../../store'
import { Home } from '.'

beforeEach(() => {
  useBillStore.setState({
    id: '',
    currency: 'ZAR',
    people: [],
    items: [],
    tip: { type: 'percentage', value: 0 },
    serviceFee: { type: 'fixed', value: 0 },
    deliveryFee: { type: 'fixed', value: 0 },
  })
  localStorage.clear()
})

describe('Home', () => {
  it('renders the app name', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: /split the bill fairly/i }),
    ).toBeInTheDocument()
  })

  it('shows Start a new bill button', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('button', { name: /start a new bill/i }),
    ).toBeInTheDocument()
  })

  it('shows Continue button when a bill is in progress', () => {
    useBillStore.setState({
      id: 'active-bill-id',
      people: [{ id: 'p1', name: 'Alice' }],
    })
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('button', { name: /continue/i }),
    ).toBeInTheDocument()
  })

  it('does not show Continue button with no active bill', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(
      screen.queryByRole('button', { name: /continue/i }),
    ).not.toBeInTheDocument()
  })
})
