import clsx from 'clsx'
import { PERSON_COLORS } from '../types'

interface PersonChipProps {
  name: string
  index: number
  size?: 'sm' | 'md'
  /** Set to true when the chip is alongside visible text — hides it from screen readers */
  decorative?: boolean
  className?: string
}

export function PersonChip({
  name,
  index,
  size = 'md',
  decorative = false,
  className,
}: PersonChipProps) {
  const color = PERSON_COLORS[index % PERSON_COLORS.length]
  const initials = [...name].slice(0, 2).join('').toUpperCase()

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-bold text-ink select-none shrink-0',
        size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm',
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden={decorative || undefined}
      {...(!decorative && { role: 'img', 'aria-label': name, title: name })}
    >
      {initials}
    </span>
  )
}
