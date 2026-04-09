import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { BottomAction } from '../../components/BottomAction'
import { PageLayout } from '../../components/PageLayout'
import { useBillStore } from '../../store'
import { SharedCostRow } from './SharedCostRow'

type ExtraKey = 'tip' | 'serviceFee' | 'deliveryFee' | 'tax' | 'discount'

export function Extras() {
  const navigate = useNavigate()
  const {
    tip,
    serviceFee,
    deliveryFee,
    tax,
    discount,
    setSharedCost,
    currency,
  } = useBillStore(
    useShallow((s) => ({
      tip: s.tip,
      serviceFee: s.serviceFee,
      deliveryFee: s.deliveryFee,
      tax: s.tax,
      discount: s.discount,
      setSharedCost: s.setSharedCost,
      currency: s.currency,
    })),
  )

  const [expanded, setExpanded] = useState<Record<ExtraKey, boolean>>(() => ({
    tip: true,
    serviceFee: serviceFee.value > 0,
    deliveryFee: deliveryFee.value > 0,
    tax: tax.value > 0,
    discount: discount.value > 0,
  }))

  const toggle = (key: ExtraKey) => {
    setExpanded((prev) => {
      const next = !prev[key]
      if (!next) {
        const current = useBillStore.getState()[key]
        setSharedCost(key, { type: current.type, value: 0 })
      }
      return { ...prev, [key]: next }
    })
  }

  return (
    <PageLayout backTo="/items" step={3}>
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
              expanded={expanded.tip}
              onToggle={() => toggle('tip')}
            />
            <SharedCostRow
              label="Service fee"
              value={serviceFee}
              currency={currency}
              onChange={(cost) => setSharedCost('serviceFee', cost)}
              expanded={expanded.serviceFee}
              onToggle={() => toggle('serviceFee')}
            />
            <SharedCostRow
              label="Delivery fee"
              value={deliveryFee}
              currency={currency}
              onChange={(cost) => setSharedCost('deliveryFee', cost)}
              expanded={expanded.deliveryFee}
              onToggle={() => toggle('deliveryFee')}
            />
            <SharedCostRow
              label="Tax"
              value={tax}
              currency={currency}
              onChange={(cost) => setSharedCost('tax', cost)}
              expanded={expanded.tax}
              onToggle={() => toggle('tax')}
              collapsedHint="Included in item prices"
            />
            <SharedCostRow
              label="Discount"
              value={discount}
              currency={currency}
              onChange={(cost) => setSharedCost('discount', cost)}
              expanded={expanded.discount}
              onToggle={() => toggle('discount')}
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
    </PageLayout>
  )
}
