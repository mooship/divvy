import { PersonChip } from '../../components/PersonChip'
import { formatCents } from '../../lib/calc'
import type { Currency, PersonTotal } from '../../types'

interface PersonCardProps {
  total: PersonTotal
  currency: Currency
  personIndex: number
}

export function PersonCard({ total, currency, personIndex }: PersonCardProps) {
  return (
    <section
      className="card p-4"
      aria-labelledby={`person-card-${personIndex}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <PersonChip name={total.name} index={personIndex} decorative />
        <h2
          id={`person-card-${personIndex}`}
          className="text-lg font-bold text-ink flex-1"
        >
          {total.name}
        </h2>
        <span className="text-xl font-bold text-ink">
          {formatCents(total.total, currency)}
        </span>
      </div>

      <ul className="border-t border-surface pt-3 flex flex-col gap-1">
        {total.itemBreakdown.map((item) => (
          <li key={item.itemId} className="flex justify-between text-sm">
            <span className="text-muted">{item.name}</span>
            <span className="text-ink">
              {formatCents(item.amount, currency)}
            </span>
          </li>
        ))}
        {(
          [
            ['Tip', total.tipShare],
            ['Service fee', total.serviceFeeShare],
            ['Delivery fee', total.deliveryFeeShare],
            ['Tax', total.taxShare],
          ] as const
        )
          .filter(([, amount]) => amount > 0)
          .map(([label, amount]) => (
            <li key={label} className="flex justify-between text-sm">
              <span className="text-muted">{label}</span>
              <span className="text-ink">{formatCents(amount, currency)}</span>
            </li>
          ))}
        {total.discountShare > 0 && (
          <li className="flex justify-between text-sm">
            <span className="text-muted">Discount</span>
            <span className="text-teal">
              -{formatCents(total.discountShare, currency)}
            </span>
          </li>
        )}
      </ul>
    </section>
  )
}
