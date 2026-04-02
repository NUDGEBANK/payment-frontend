import { apiRequest } from './client'
import { fetchPaymentSession } from './userApi'
import type { PaymentSession } from '../types/payment'

interface PaymentActionResponse {
  qrId: string
  status: PaymentSession['status']
  changedAt: string
  message: string
}

async function runDetailAction(
  qrId: string,
  action: 'scan' | 'approve' | 'reject',
) {
  const detail = await apiRequest<Omit<PaymentSession, 'lines' | 'expiresAt'>>(
    `/api/payments/qr/${qrId}/${action}`,
    { method: 'POST' },
  )

  const session = await fetchPaymentSession(detail.qrId)
  return {
    ...session,
    status: detail.status,
  } satisfies PaymentSession
}

async function runStatusAction(
  qrId: string,
  action: 'approve' | 'reject' | 'cancel' | 'expire',
) {
  const result = await apiRequest<PaymentActionResponse>(`/api/payments/qr/${qrId}/${action}`, {
    method: 'POST',
  })
  const session = await fetchPaymentSession(result.qrId)
  return {
    ...session,
    status: result.status,
    changedAt: result.changedAt,
    message: result.message,
  } satisfies PaymentSession
}

export async function scanPayment(qrId: string) {
  return runDetailAction(qrId, 'scan')
}

export async function approvePayment(qrId: string) {
  return runStatusAction(qrId, 'approve')
}

export async function rejectPayment(qrId: string) {
  return runStatusAction(qrId, 'reject')
}
