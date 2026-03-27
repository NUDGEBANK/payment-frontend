import type { PaymentSession } from '../../types/payment'

export function buildDemoSession(
  payload: string,
  status: PaymentSession['status'],
): PaymentSession {
  const now = new Date().toISOString()

  return {
    id: `demo-${payload.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'scan'}`,
    merchantId: 'demo-merchant',
    merchantName: '데모 단말 결제',
    status,
    amount: 45000,
    createdAt: now,
    approvedAt: status === 'APPROVED' || status === 'COMPLETED' ? now : undefined,
    lines: [
      {
        productId: 'demo-product',
        name: 'QR 스캔 데모 상품',
        quantity: 1,
        unitPrice: 45000,
      },
    ],
    qrCode: payload,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    approvalCode: '#DEMO-2401',
    cardLast4: '9402',
  }
}
