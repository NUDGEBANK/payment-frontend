import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchRegisteredCard } from '../../api/userApi'
import type { CartItem, PaymentSession, RegisteredCard } from '../../types/payment'

interface UserAppContextValue {
  card: RegisteredCard | null
  setCard: (card: RegisteredCard | null) => void
  pendingCart: CartItem[]
  setPendingCart: (items: CartItem[]) => void
  activePayment: PaymentSession | null
  setActivePayment: (payment: PaymentSession | null) => void
  loading: boolean
}

const UserAppContext = createContext<UserAppContextValue | null>(null)

export function UserAppProvider({ children }: { children: ReactNode }) {
  const [card, setCard] = useState<RegisteredCard | null>(null)
  const [pendingCart, setPendingCart] = useState<CartItem[]>([])
  const [activePayment, setActivePayment] = useState<PaymentSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRegisteredCard()
      .then(setCard)
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      card,
      setCard,
      pendingCart,
      setPendingCart,
      activePayment,
      setActivePayment,
      loading,
    }),
    [activePayment, card, loading, pendingCart],
  )

  return <UserAppContext.Provider value={value}>{children}</UserAppContext.Provider>
}

export function useUserApp() {
  const context = useContext(UserAppContext)
  if (!context) {
    throw new Error('useUserApp must be used within UserAppProvider')
  }

  return context
}
