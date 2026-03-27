import { Navigate } from 'react-router-dom'
import { useUserApp } from '../../app/providers/UserAppProvider'

export function UserHomePage() {
  const { card, loading } = useUserApp()

  if (loading) {
    return null
  }

  return <Navigate to={card ? '/user/card' : '/user/register'} replace />
}
