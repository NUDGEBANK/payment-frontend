import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, parsePaymentQrPayload } from '../../api/mockClient'
import { fetchPendingTerminalPayment, scanPayment } from '../../api/terminalApi'
import { ScannerPreview } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'

export function TerminalScanPage() {
  const navigate = useNavigate()
  const [payment, setPayment] = useState<PaymentSession | null>(null)

  useEffect(() => {
    fetchPendingTerminalPayment().then(setPayment)
  }, [])

  const handleDetected = async (decodedText: string) => {
    const paymentId = parsePaymentQrPayload(decodedText)

    if (paymentId) {
      try {
        const scanned = await scanPayment(paymentId)
        navigate(`/terminal/decision?paymentId=${scanned.id}&payload=${encodeURIComponent(decodedText)}`)
        return
      } catch {
        navigate(`/terminal/decision?payload=${encodeURIComponent(decodedText)}`)
        return
      }
    }

    navigate(`/terminal/decision?payload=${encodeURIComponent(decodedText)}`)
  }

  return (
    <AppFrame>
      <PageHeader title="QR 스캐너" backTo="/terminal" />
      <Content>
        <div className="space-y-6">
          <ScannerPreview hasPayment={Boolean(payment)} onDetected={handleDetected} />
          {payment ? (
            <SectionCard className="bg-white/90">
              <p className="text-sm font-bold text-slate-400">스캔 대기 결제</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black tracking-[-0.04em] text-slate-800">{payment.merchantName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    {payment.lines[0]?.name}
                    {payment.lines.length > 1 ? ` 외 ${payment.lines.length - 1}건` : ''}
                  </p>
                </div>
                <p className="text-3xl font-black text-blue-600">{formatCurrency(payment.amount)}</p>
              </div>
            </SectionCard>
          ) : null}
          <PrimaryButton
            className="w-full"
            disabled={!payment}
            onClick={async () => {
              if (!payment) return
              const scanned = await scanPayment(payment.id)
              navigate(`/terminal/decision?paymentId=${scanned.id}&payload=${encodeURIComponent(scanned.qrCode)}`)
            }}
          >
            QR 스캔 시뮬레이션
          </PrimaryButton>
        </div>
      </Content>
      <BottomNav terminal />
    </AppFrame>
  )
}
