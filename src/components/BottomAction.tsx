interface BottomActionProps {
  children: React.ReactNode
}

export function BottomAction({ children }: BottomActionProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-bg border-t border-surface px-4 pt-3"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  )
}
