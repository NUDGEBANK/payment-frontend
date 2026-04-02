export type PaymentStatus =
  | 'CREATED'
  | 'SCANNED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'EXPIRED'

export type DateFilterPreset =
  | 'ONE_MONTH'
  | 'THREE_MONTHS'
  | 'SIX_MONTHS'
  | 'ONE_YEAR'
  | 'CUSTOM'

export interface RegisteredCard {
  cardId: number
  alias: string
  numberMasked: string
  expiredYm: string
  balance: number
}

export interface MenuItem {
  menuId: number
  menuName: string
  price: number
}

export interface Market {
  marketId: number
  marketName: string
  menus: MenuItem[]
}

export interface Category {
  categoryId: number
  categoryName: string
  mcc: string
  markets: Market[]
}

export interface CatalogResponse {
  categories: Category[]
}

export interface CartItem {
  menuId: number
  quantity: number
}

export interface PaymentLine {
  menuName: string
  quantity: number
  unitPrice: number
}

export interface PaymentSession {
  qrId: string
  cardId: number
  marketId: number
  marketName: string
  paymentAmount: number
  requestedAt: string
  status: PaymentStatus
  menuName: string
  quantity: number
  lines: PaymentLine[]
  expiresAt: string
  changedAt?: string
  message?: string
}

export interface CardHistorySummary {
  cardId: number
  currentBalance: number
  currentMonthSpending: number
  previousMonthSpending: number
  changeRatePercent: number | null
}

export interface TransactionItem {
  transactionId: number
  qrId: string
  marketId: number
  marketName: string
  categoryId: number
  categoryName: string
  amount: number
  transactionDatetime: string
  menuName: string
  quantity: number
}

export interface TransactionsResponse {
  cardId: number
  periodType: DateFilterPreset
  startDate?: string
  endDate?: string
  count: number
  transactions: TransactionItem[]
}

export interface ApiErrorField {
  field: string
  reason: string
}

export interface ApiErrorResponse {
  code: string
  message: string
  status: number
  timestamp: string
  fieldErrors?: ApiErrorField[]
}
