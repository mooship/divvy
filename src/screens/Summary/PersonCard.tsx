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
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <PersonChip name={total.name} index={personIndex} decorative />
        <h2 className="text-lg font-bold text-ink flex-1">{total.name}</h2>
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
        {total.tipShare > 0 && (
          <li className="flex justify-between text-sm">
            <span className="text-muted">Tip</span>
            <span className="text-ink">
              {formatCents(total.tipShare, currency)}
            </span>
          </li>
        )}
        {total.serviceFeeShare > 0 && (
          <li className="flex justify-between text-sm">
            <span className="text-muted">Service fee</span>
            <span className="text-ink">
              {formatCents(total.serviceFeeShare, currency)}
            </span>
          </li>
        )}
        {total.deliveryFeeShare > 0 && (
          <li className="flex justify-between text-sm">
            <span className="text-muted">Delivery fee</span>
            <span className="text-ink">
              {formatCents(total.deliveryFeeShare, currency)}
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}
