import { AppHeader } from './AppHeader'

interface PageLayoutProps {
  children: React.ReactNode
  backTo?: string
  step?: number
}

export function PageLayout({ children, backTo, step }: PageLayoutProps) {
  return (
    <>
      <AppHeader backTo={backTo} step={step} />
      <main
        className="mx-auto w-full max-w-md"
        style={{
          paddingTop: step
            ? 'calc(4.25rem + env(safe-area-inset-top, 0px))'
            : 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        {children}
      </main>
    </>
  )
}
