import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { formatCurrency } from '../../api/mockClient'
import { scanPayment } from '../../api/terminalApi'
import { ScannerPreview } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'

export function TerminalScanPage() {
  const navigate = useNavigate()
  const [payment, setPayment] = useState<PaymentSession | null>(null)
  const [error, setError] = useState('')
  const processingRef = useRef(false)

  const handleDetected = async (decodedText: string) => {
    if (processingRef.current) {
      return
    }

    try {
      processingRef.current = true
      setError('')
      const qrId = decodedText.trim()
      const scanned = await scanPayment(qrId)
      setPayment(scanned)
      navigate(`/terminal/decision?qrId=${scanned.qrId}`)
    } catch (caught) {
      processingRef.current = false
      if (caught instanceof ApiError) {
        setError(caught.code)
      } else {
        setError('스캔한 QR을 처리하지 못했습니다.')
      }
    }
  }

  return (
    <AppFrame>
      <PageHeader title="QR 스캔" backTo="/terminal" />
      <Content>
        <div className="space-y-6">
          <ScannerPreview hasPayment onDetected={handleDetected} />
          {payment ? (
            <SectionCard className="bg-white/90">
              <p className="text-sm font-bold text-slate-400">인식된 결제</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black tracking-[-0.04em] text-slate-800">{payment.marketName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    {payment.menuName} {payment.quantity}개
                  </p>
                </div>
                <p className="text-3xl font-black text-blue-600">{formatCurrency(payment.paymentAmount)}</p>
              </div>
            </SectionCard>
          ) : null}
          {error ? (
            <SectionCard className="bg-rose-50 text-rose-600">
              <p className="text-sm font-bold">{error}</p>
            </SectionCard>
          ) : null}
          <PrimaryButton className="w-full" onClick={() => navigate('/terminal')}>
            스캔 종료
          </PrimaryButton>
        </div>
      </Content>
      <BottomNav terminal />
    </AppFrame>
  )
}
