import { merchants } from '../mock/data'
import type {
  CartItem,
  DateFilterPreset,
  OrderLine,
  PaymentSession,
  RegisteredCard,
  TransactionItem,
} from '../types/payment'
import {
  buildPaymentQrPayload,
  formatCurrency,
  generateId,
  readDatabase,
  updateDatabase,
} from './mockClient'

export async function fetchRegisteredCard() {
  const db = await readDatabase()
  return db.card
}

export async function registerCard(input: {
  alias: string
  cardNumber: string
  exp: string
  password: string
}) {
  const numberMasked = `•••• •••• •••• ${input.cardNumber.slice(-4)}`
  const card: RegisteredCard = {
    id: generateId('card'),
    alias: input.alias,
    numberMasked,
    exp: input.exp,
    passwordHint: '*'.repeat(input.password.length),
    balance: 1500000,
  }

  await updateDatabase((db) => ({ ...db, card }))
  return card
}

export async function fetchCatalog() {
  const db = await readDatabase()
  return { categories: db.categories, merchants: db.merchants }
}

export async function fetchTransactions(filter: {
  preset: DateFilterPreset
  customStart?: string
  customEnd?: string
}) {
  const db = await readDatabase()
  const endDate = filter.preset === 'CUSTOM' && filter.customEnd
    ? new Date(filter.customEnd)
    : new Date()
  const startDate = new Date(endDate)

  if (filter.preset === '1M') startDate.setMonth(startDate.getMonth() - 1)
  if (filter.preset === '3M') startDate.setMonth(startDate.getMonth() - 3)
  if (filter.preset === '6M') startDate.setMonth(startDate.getMonth() - 6)
  if (filter.preset === '1Y') startDate.setFullYear(startDate.getFullYear() - 1)
  if (filter.preset === 'CUSTOM' && filter.customStart) {
    startDate.setTime(new Date(filter.customStart).getTime())
  }

  return db.transactions.filter((item) => {
    const approvedAt = new Date(item.approvedAt)
    return approvedAt >= startDate && approvedAt <= endDate
  })
}

export async function createPaymentSession(input: {
  merchantId: string
  cart: CartItem[]
}) {
  const merchant = merchants.find((item) => item.id === input.merchantId)
  if (!merchant) {
    throw new Error('가맹점 정보를 찾을 수 없습니다.')
  }

  const lines: OrderLine[] = input.cart
    .map((cartItem) => {
      const product = merchant.products.find((item) => item.id === cartItem.productId)
      if (!product || cartItem.quantity <= 0) {
        return null
      }

      return {
        productId: product.id,
        name: product.name,
        quantity: cartItem.quantity,
        unitPrice: product.price,
      }
    })
    .filter((item): item is OrderLine => Boolean(item))

  const amount = lines.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  )
  const paymentId = generateId('pay')

  const session: PaymentSession = {
    id: paymentId,
    merchantId: merchant.id,
    merchantName: merchant.name,
    status: 'WAITING',
    amount,
    createdAt: new Date().toISOString(),
    lines,
    qrCode: buildPaymentQrPayload(paymentId),
    expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
  }

  await updateDatabase((current) => ({
    ...current,
    paymentSessions: [
      ...current.paymentSessions.filter((item) =>
        !['WAITING', 'SCANNED', 'APPROVED'].includes(item.status),
      ),
      session,
    ],
  }))

  return session
}

export async function fetchPaymentSession(paymentId: string) {
  const db = await readDatabase()
  return db.paymentSessions.find((item) => item.id === paymentId) ?? null
}

export async function refreshPaymentQr(paymentId: string) {
  const db = await readDatabase()
  const session = db.paymentSessions.find((item) => item.id === paymentId)
  if (!session) {
    throw new Error('결제 세션이 없습니다.')
  }

  const updated = {
    ...session,
    qrCode: buildPaymentQrPayload(paymentId),
    expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
  }

  await updateDatabase((current) => ({
    ...current,
    paymentSessions: current.paymentSessions.map((item) =>
      item.id === paymentId ? updated : item,
    ),
  }))

  return updated
}

export async function cancelPaymentSession(paymentId: string) {
  await updateDatabase((current) => ({
    ...current,
    paymentSessions: current.paymentSessions.map((item) =>
      item.id === paymentId ? { ...item, status: 'CANCELLED' } : item,
    ),
  }))
}

export async function createTransactionFromPayment(session: PaymentSession) {
  const card = await fetchRegisteredCard()
  if (!card) {
    return null
  }

  const transaction: TransactionItem = {
    id: generateId('tx'),
    merchant: session.merchantName,
    category: '결제',
    amount: -session.amount,
    type: 'PAYMENT',
    approvedAt: session.approvedAt ?? new Date().toISOString(),
  }

  await updateDatabase((current) => ({
    ...current,
    card: { ...card, balance: card.balance - session.amount },
    transactions: [transaction, ...current.transactions],
  }))

  return {
    transaction,
    balanceLabel: formatCurrency(card.balance - session.amount),
  }
}
