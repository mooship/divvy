import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { BottomAction } from '../../components/BottomAction'
import { useBillStore } from '../../store'
import { SharedCostRow } from './SharedCostRow'

export function Extras() {
  const navigate = useNavigate()
  const { tip, serviceFee, deliveryFee, setSharedCost, currency } =
    useBillStore(
      useShallow((s) => ({
        tip: s.tip,
        serviceFee: s.serviceFee,
        deliveryFee: s.deliveryFee,
        setSharedCost: s.setSharedCost,
        currency: s.currency,
      })),
    )

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-bold text-ink mb-2">Extras</h1>
        <p className="text-muted text-sm mb-6">
          Distributed proportionally based on each person's subtotal.
        </p>

        <div className="flex flex-col gap-4">
          <SharedCostRow
            label="Tip"
            value={tip}
            currency={currency}
            onChange={(cost) => setSharedCost('tip', cost)}
          />
          <SharedCostRow
            label="Service fee"
            value={serviceFee}
            currency={currency}
            onChange={(cost) => setSharedCost('serviceFee', cost)}
          />
          <SharedCostRow
            label="Delivery fee"
            value={deliveryFee}
            currency={currency}
            onChange={(cost) => setSharedCost('deliveryFee', cost)}
          />
        </div>
      </div>

      <BottomAction>
        <button
          type="button"
          onClick={() => navigate('/summary')}
          className="btn-primary w-full focus-ring"
        >
          See summary
        </button>
      </BottomAction>
    </div>
  )
}
