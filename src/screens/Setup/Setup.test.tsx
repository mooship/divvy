import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useBillStore } from '../../store'
import { Setup } from '.'

beforeEach(() => {
  useBillStore.setState({
    id: 'test-id',
    currency: 'ZAR',
    people: [],
    items: [],
    tip: { type: 'percentage', value: 0 },
    serviceFee: { type: 'fixed', value: 0 },
    deliveryFee: { type: 'fixed', value: 0 },
  })
  localStorage.clear()
})

describe('Setup', () => {
  it('renders the currency selector', () => {
    render(
      <MemoryRouter>
        <Setup />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /ZAR/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /USD/i })).toBeInTheDocument()
  })

  it('adds a person when name is entered and Add is clicked', () => {
    render(
      <MemoryRouter>
        <Setup />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByPlaceholderText(/add a name/i), {
      target: { value: 'Alice' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add person/i }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(useBillStore.getState().people).toHaveLength(1)
  })

  it('adds a person on Enter key', () => {
    render(
      <MemoryRouter>
        <Setup />
      </MemoryRouter>,
    )
    const input = screen.getByPlaceholderText(/add a name/i)
    fireEvent.change(input, { target: { value: 'Bob' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(useBillStore.getState().people).toHaveLength(1)
  })

  it('Next button is disabled with fewer than 2 people', () => {
    render(
      <MemoryRouter>
        <Setup />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByPlaceholderText(/add a name/i), {
      target: { value: 'Alice' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add person/i }))
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('Next button is enabled with 2 or more people', () => {
    useBillStore.setState({
      id: 'test-id',
      currency: 'ZAR',
      people: [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ],
      items: [],
      tip: { type: 'percentage', value: 0 },
      serviceFee: { type: 'fixed', value: 0 },
      deliveryFee: { type: 'fixed', value: 0 },
    })
    render(
      <MemoryRouter>
        <Setup />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })
})
