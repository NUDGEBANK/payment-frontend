import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cancelPaymentSession, fetchPaymentSession, refreshPaymentQr } from '../../api/userApi'
import { formatCurrency } from '../../api/mockClient'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { PaymentSummary, QrPlaceholder } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton, SecondaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'

function getRemaining(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now()
  const safe = Math.max(ms, 0)
  const minutes = String(Math.floor(safe / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((safe % 60000) / 1000)).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function PaymentQrPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('paymentId')
  const { activePayment, setActivePayment } = useUserApp()
  const [session, setSession] = useState<PaymentSession | null>(activePayment)
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    if (!paymentId) {
      return
    }
    fetchPaymentSession(paymentId).then((data) => {
      setSession(data)
      setActivePayment(data)
    })
  }, [paymentId, setActivePayment])

  useEffect(() => {
    if (!session) {
      return
    }

    const tick = () => setRemaining(getRemaining(session.expiresAt))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [session])

  const itemLabel = useMemo(() => {
    if (!session || session.lines.length === 0) {
      return '선택한 상품이 없습니다.'
    }
    const [first, ...rest] = session.lines
    return `${first.name}${rest.length > 0 ? ` 외 ${rest.length}건` : ''}`
  }, [session])

  if (!session) {
    return (
      <AppFrame>
        <Content>
          <div className="flex h-full items-center justify-center">
            <PrimaryButton onClick={() => navigate('/user/shop')}>상품 선택으로 이동</PrimaryButton>
          </div>
        </Content>
      </AppFrame>
    )
  }

  return (
    <AppFrame>
      <PageHeader title="결제 QR" backTo="/user/shop" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <p className="text-sm font-bold text-slate-400">결제 금액</p>
            <p className="mt-2 text-5xl font-black tracking-[-0.06em] text-slate-800">{formatCurrency(session.amount)}</p>
            <p className="text-base font-semibold text-slate-400">{itemLabel}</p>
          </SectionCard>
          <QrPlaceholder code={session.qrCode} />
          <div className="space-y-2 text-center">
            <p className="text-3xl font-black tracking-[-0.05em] text-slate-800">결제용 QR 코드가 생성되었습니다.</p>
            <p className="text-base font-bold text-slate-500">남은 시간 {remaining}</p>
          </div>
          <div className="flex justify-center">
            <SecondaryButton
              className="min-w-40"
              onClick={async () => {
                if (!paymentId) return
                const refreshed = await refreshPaymentQr(paymentId)
                setSession(refreshed)
                setActivePayment(refreshed)
              }}
            >
              시간 연장
            </SecondaryButton>
          </div>
          <PaymentSummary
            amount={session.amount}
            merchant={session.merchantName}
            floating={false}
            secondaryLabel="결제 취소"
            onSecondary={async () => {
              await cancelPaymentSession(session.id)
              setActivePayment(null)
              navigate('/user/shop')
            }}
          />
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
