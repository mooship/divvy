import { Navigate } from 'react-router-dom'
import { useBillStore } from '../store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const billId = useBillStore(s => s.id)
  if (!billId) return <Navigate to='/' replace />
  return <>{children}</>
}
