import { defaultDatabase } from '../mock/data'
import type { MockDatabase } from '../types/payment'

const STORAGE_KEY = 'virtual-payment-mock-db'

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

export async function readDatabase(): Promise<MockDatabase> {
  await wait()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase))
    return structuredClone(defaultDatabase)
  }

  return JSON.parse(raw) as MockDatabase
}

export async function writeDatabase(data: MockDatabase) {
  await wait()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

export async function updateDatabase(
  updater: (current: MockDatabase) => MockDatabase,
) {
  const current = await readDatabase()
  const next = updater(current)
  return writeDatabase(next)
}

export function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

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

export function buildPaymentQrPayload(paymentId: string) {
  return `VPAY:${paymentId}`
}

export function parsePaymentQrPayload(payload: string) {
  if (!payload.startsWith('VPAY:')) {
    return null
  }

  return payload.slice('VPAY:'.length)
}
