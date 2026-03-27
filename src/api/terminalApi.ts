import { createTransactionFromPayment } from './userApi'
import { generateId, readDatabase, updateDatabase } from './mockClient'

export async function fetchPendingTerminalPayment() {
  const db = await readDatabase()
  return (
    db.paymentSessions.find((item) =>
      ['WAITING', 'SCANNED', 'APPROVED'].includes(item.status),
    ) ?? null
  )
}

export async function scanPayment(paymentId: string) {
  const db = await readDatabase()
  const target = db.paymentSessions.find((item) => item.id === paymentId)
  if (!target) {
    throw new Error('스캔할 결제가 없습니다.')
  }

  const updated = { ...target, status: 'SCANNED' as const }
  await updateDatabase((current) => ({
    ...current,
    paymentSessions: current.paymentSessions.map((item) =>
      item.id === paymentId ? updated : item,
    ),
  }))

  return updated
}

export async function approvePayment(paymentId: string) {
  const db = await readDatabase()
  const target = db.paymentSessions.find((item) => item.id === paymentId)
  if (!target) {
    throw new Error('승인할 결제가 없습니다.')
  }

  const updated = {
    ...target,
    status: 'APPROVED' as const,
    approvalCode: `#${generateId('TXN').slice(-8).toUpperCase()}`,
    cardLast4: '9402',
    approvedAt: new Date().toISOString(),
  }

  await updateDatabase((current) => ({
    ...current,
    paymentSessions: current.paymentSessions.map((item) =>
      item.id === paymentId ? updated : item,
    ),
  }))

  return updated
}

export async function rejectPayment(paymentId: string) {
  const db = await readDatabase()
  const target = db.paymentSessions.find((item) => item.id === paymentId)
  if (!target) {
    throw new Error('거절할 결제가 없습니다.')
  }

  const updated = { ...target, status: 'REJECTED' as const }
  await updateDatabase((current) => ({
    ...current,
    paymentSessions: current.paymentSessions.map((item) =>
      item.id === paymentId ? updated : item,
    ),
  }))

  return updated
}

export async function completePayment(paymentId: string) {
  const db = await readDatabase()
  const target = db.paymentSessions.find((item) => item.id === paymentId)
  if (!target) {
    throw new Error('완료할 결제가 없습니다.')
  }

  const updated = {
    ...target,
    status: 'COMPLETED' as const,
    approvedAt: target.approvedAt ?? new Date().toISOString(),
  }

  await updateDatabase((current) => ({
    ...current,
    paymentSessions: current.paymentSessions.map((item) =>
      item.id === paymentId ? updated : item,
    ),
  }))

  await createTransactionFromPayment(updated)

  return updated
}
