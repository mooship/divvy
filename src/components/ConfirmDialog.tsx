import * as AlertDialog from '@radix-ui/react-alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-ink/40 z-40 animate-fade-in" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg rounded-2xl p-6 w-[calc(100%-2rem)] max-w-sm z-50 shadow-lg animate-fade-in">
          <AlertDialog.Title className="text-lg font-bold text-ink mb-2">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted mb-6">
            {description}
          </AlertDialog.Description>
          <div className="flex gap-2">
            <AlertDialog.Cancel asChild>
              <button type="button" className="btn-ghost flex-1 focus-ring">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 flex items-center justify-center gap-2 bg-danger text-white rounded-2xl font-bold min-h-12 px-6 transition-transform active:scale-95 focus-ring"
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
