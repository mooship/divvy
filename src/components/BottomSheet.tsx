import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

interface BottomSheetProps {
  children: React.ReactNode
  className?: string
  ariaLabel?: string
  onClose?: () => void
}

export function BottomSheet({
  children,
  className,
  ariaLabel,
  onClose,
}: BottomSheetProps) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50 animate-fade-in" />
        <Dialog.Content
          className={`fixed bottom-0 left-0 right-0 bg-bg w-full max-w-md mx-auto rounded-t-2xl p-6 z-50 animate-slide-up${className ? ` ${className}` : ''}`}
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          aria-label={ariaLabel}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>{ariaLabel ?? 'Dialog'}</Dialog.Title>
          </VisuallyHidden.Root>
          <div className="w-9 h-1 rounded-full bg-muted/30 mx-auto mb-4" />
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
