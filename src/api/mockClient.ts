export function formatCurrency(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function getPaymentExpiresAt(requestedAt: string) {
  return new Date(new Date(requestedAt).getTime() + 3 * 60 * 1000).toISOString()
}

export function parsePaymentQrPayload(payload: string) {
  const normalized = payload.trim()
  return normalized || null
}

export function maskCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '')
  const last4 = digits.slice(-4)
  return `**** **** **** ${last4}`
}
