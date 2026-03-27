export type PaymentStatus =
  | 'WAITING'
  | 'SCANNED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'

export type DateFilterPreset = '1M' | '3M' | '6M' | '1Y' | 'CUSTOM'

export interface RegisteredCard {
  id: string
  alias: string
  numberMasked: string
  exp: string
  passwordHint: string
  balance: number
}

export interface TransactionItem {
  id: string
  merchant: string
  category: string
  amount: number
  type: 'PAYMENT' | 'CHARGE'
  approvedAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
}

export interface Merchant {
  id: string
  name: string
  majorCategory: string
  subCategory: string
  products: Product[]
}

export interface CategoryGroup {
  major: string
  label: string
  subCategories: string[]
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface OrderLine {
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

export interface PaymentSession {
  id: string
  merchantId: string
  merchantName: string
  status: PaymentStatus
  amount: number
  createdAt: string
  approvedAt?: string
  lines: OrderLine[]
  qrCode: string
  expiresAt: string
  approvalCode?: string
  cardLast4?: string
}

export interface MockDatabase {
  card: RegisteredCard | null
  transactions: TransactionItem[]
  merchants: Merchant[]
  categories: CategoryGroup[]
  paymentSessions: PaymentSession[]
}
