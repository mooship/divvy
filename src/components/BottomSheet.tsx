interface BottomSheetProps {
  children: React.ReactNode
  className?: string
}

export function BottomSheet({ children, className }: BottomSheetProps) {
  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-end justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-bg w-full max-w-md rounded-t-2xl p-6${className ? ` ${className}` : ''}`}
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        {children}
      </div>
    </div>
  )
}
