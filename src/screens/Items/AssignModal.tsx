import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { PersonChip } from '../../components/PersonChip'
import { useBillStore } from '../../store'

interface AssignModalProps {
  itemId: string
  onClose: () => void
}

export function AssignModal({ itemId, onClose }: AssignModalProps) {
  const { items, people, assignItem } = useBillStore(
    useShallow((s) => ({
      items: s.items,
      people: s.people,
      assignItem: s.assignItem,
    })),
  )
  const item = items.find((i) => i.id === itemId)
  const [selected, setSelected] = useState(
    () => new Set(item?.assignedTo ?? []),
  )

  if (!item) {
    return null
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleConfirm = () => {
    assignItem(item.id, [...selected])
    onClose()
  }

  const assignedNameList = people
    .filter((p) => selected.has(p.id))
    .map((p) => p.name)
  const assignedNames =
    assignedNameList.length <= 1
      ? (assignedNameList[0] ?? '')
      : `${assignedNameList.slice(0, -1).join(', ')} and ${assignedNameList.at(-1)}`

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-40" />
        <Dialog.Content
          className="fixed bottom-0 left-0 right-0 bg-bg rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto z-50"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        >
          <Dialog.Title className="text-lg font-bold text-ink mb-1">
            Assign: {item.name}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted mb-4">
            Tap people to split this item between them
          </Dialog.Description>

          <fieldset className="mb-6">
            <legend className="sr-only">People to assign</legend>
            <ul className="flex flex-col gap-2">
              {people.map((person, i) => {
                const isSelected = selected.has(person.id)
                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => toggle(person.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors focus-ring',
                        isSelected
                          ? 'bg-teal/20 border-2 border-teal'
                          : 'bg-surface border-2 border-transparent',
                      )}
                      aria-pressed={isSelected}
                    >
                      <PersonChip
                        name={person.name}
                        index={i}
                        size="sm"
                        decorative
                      />
                      <span className="font-medium text-ink">
                        {person.name}
                      </span>
                      {isSelected && (
                        <span className="ml-auto" aria-hidden="true">
                          ✅
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </fieldset>

          <div aria-live="polite" className="sr-only">
            {selected.size > 0
              ? `${item.name} assigned to ${assignedNames}`
              : `${item.name} unassigned`}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary w-full focus-ring"
          >
            Confirm
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
