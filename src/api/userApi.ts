import { apiRequest } from './client'
import { getPaymentExpiresAt, maskCardNumber } from './mockClient'
import type {
  CardHistorySummary,
  CatalogResponse,
  DateFilterPreset,
  PaymentSession,
  RegisteredCard,
  TransactionsResponse,
} from '../types/payment'

const CARD_STORAGE_KEY = 'payment-frontend-card'

interface StoredCard {
  cardId: number
  alias: string
  numberMasked: string
  expiredYm: string
}

interface VerifyCardResponse {
  cardId: number
  verified: boolean
  message: string
}

interface CardBalanceResponse {
  cardId: number
  accountId: number
  balance: number
}

interface CreatePaymentResponse {
  qrId: string
  status: PaymentSession['status']
}

interface PaymentDetailResponse {
  qrId: string
  cardId: number
  marketId: number
  marketName: string
  paymentAmount: number
  requestedAt: string
  status: PaymentSession['status']
  menuName: string
  quantity: number
}

interface PaymentActionResponse {
  qrId: string
  status: PaymentSession['status']
  changedAt: string
  message: string
}

function readStoredCard(): StoredCard | null {
  const raw = localStorage.getItem(CARD_STORAGE_KEY)
  if (!raw) {
    return null
  }

  return JSON.parse(raw) as StoredCard
}

function writeStoredCard(card: StoredCard | null) {
  if (!card) {
    localStorage.removeItem(CARD_STORAGE_KEY)
    return
  }

  localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(card))
}

function toPaymentSession(
  detail: PaymentDetailResponse,
  action?: PaymentActionResponse,
): PaymentSession {
  const unitPrice = detail.quantity > 0 ? detail.paymentAmount / detail.quantity : detail.paymentAmount

  return {
    ...detail,
    lines: [
      {
        menuName: detail.menuName,
        quantity: detail.quantity,
        unitPrice,
      },
    ],
    expiresAt: getPaymentExpiresAt(detail.requestedAt),
    changedAt: action?.changedAt,
    message: action?.message,
  }
}

export async function fetchRegisteredCard() {
  const stored = readStoredCard()
  if (!stored) {
    return null
  }

  const balance = await fetchCardBalance(stored.cardId)
  return {
    ...stored,
    balance: balance.balance,
  } satisfies RegisteredCard
}

export async function registerCard(input: {
  alias: string
  cardNumber: string
  exp: string
  password: string
}) {
  const expiredYm = input.exp
  const response = await apiRequest<VerifyCardResponse>('/api/card/verify', {
    method: 'POST',
    body: JSON.stringify({
      cardNumber: input.cardNumber.replace(/\s/g, '-'),
      expiredYm,
      password: input.password,
    }),
  })

  const storedCard: StoredCard = {
    cardId: response.cardId,
    alias: input.alias,
    numberMasked: maskCardNumber(input.cardNumber),
    expiredYm,
  }

  writeStoredCard(storedCard)

  const balance = await fetchCardBalance(response.cardId)
  return {
    ...storedCard,
    balance: balance.balance,
  } satisfies RegisteredCard
}

export async function clearRegisteredCard() {
  writeStoredCard(null)
}

export async function fetchCardBalance(cardId: number) {
  return apiRequest<CardBalanceResponse>(`/api/card/${cardId}/balance`)
}

export async function fetchCatalog() {
  return apiRequest<CatalogResponse>('/api/products/categories-markets-menus')
}

export async function fetchHistorySummary(cardId: number) {
  return apiRequest<CardHistorySummary>(`/api/cards/${cardId}/history/summary`)
}

export async function fetchTransactions(input: {
  cardId: number
  preset: DateFilterPreset
  customStart?: string
  customEnd?: string
}) {
  const query = new URLSearchParams({ periodType: input.preset })
  if (input.preset === 'CUSTOM') {
    if (input.customStart) {
      query.set('startDate', input.customStart)
    }
    if (input.customEnd) {
      query.set('endDate', input.customEnd)
    }
  }

  return apiRequest<TransactionsResponse>(
    `/api/cards/${input.cardId}/history/transactions?${query.toString()}`,
  )
}

export async function createPaymentSession(input: {
  cardId: number
  marketId: number
  menuName: string
  quantity: number
  paymentAmount: number
}) {
  const created = await apiRequest<CreatePaymentResponse>('/api/payments/qr', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      requestedAt: new Date().toISOString(),
    }),
  })

  return fetchPaymentSession(created.qrId)
}

export async function fetchPaymentSession(qrId: string) {
  const detail = await apiRequest<PaymentDetailResponse>(`/api/payments/qr/${qrId}`)
  return toPaymentSession(detail)
}

async function runPaymentAction(
  qrId: string,
  action: 'cancel' | 'expire',
) {
  const actionResponse = await apiRequest<PaymentActionResponse>(`/api/payments/qr/${qrId}/${action}`, {
    method: 'POST',
  })
  const detail = await fetchPaymentSession(qrId)
  return {
    ...detail,
    status: actionResponse.status,
    changedAt: actionResponse.changedAt,
    message: actionResponse.message,
  } satisfies PaymentSession
}

export async function cancelPaymentSession(qrId: string) {
  return runPaymentAction(qrId, 'cancel')
}

export async function expirePaymentSession(qrId: string) {
  return runPaymentAction(qrId, 'expire')
}
