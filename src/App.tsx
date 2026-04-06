import { Outlet } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'

export default function App() {
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <AppHeader />
      <div className="mx-auto w-full max-w-md pt-14">
        <Outlet />
      </div>
    </div>
  )
}
