import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { formatCurrency } from '../../api/mockClient'
import { cancelPaymentSession, expirePaymentSession, fetchPaymentSession } from '../../api/userApi'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { PaymentSummary, QrPlaceholder } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'
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
  const qrId = searchParams.get('qrId')
  const { activePayment, setActivePayment } = useUserApp()
  const [session, setSession] = useState<PaymentSession | null>(activePayment)
  const [remaining, setRemaining] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!qrId) {
      return
    }

    const sync = async () => {
      try {
        const data = await fetchPaymentSession(qrId)
        setSession(data)
        setActivePayment(data)

        if (data.status !== 'CREATED') {
          navigate(`/user/payment/progress?qrId=${data.qrId}`, { replace: true })
        }
      } catch (caught) {
        if (caught instanceof ApiError) {
          setError(caught.code)
        } else {
          setError('결제 정보를 불러오지 못했습니다.')
        }
      }
    }

    sync()
    const timer = window.setInterval(sync, 1500)
    return () => window.clearInterval(timer)
  }, [navigate, qrId, setActivePayment])

  useEffect(() => {
    if (!session) {
      return
    }

    const tick = async () => {
      const next = getRemaining(session.expiresAt)
      setRemaining(next)

      if (next === '00:00' && session.status === 'CREATED') {
        const expired = await expirePaymentSession(session.qrId)
        setSession(expired)
        setActivePayment(expired)
        navigate(`/user/payment/result?qrId=${expired.qrId}`, { replace: true })
      }
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [navigate, session, setActivePayment])

  const itemLabel = useMemo(() => {
    if (!session) {
      return ''
    }
    return `${session.menuName} ${session.quantity}개`
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
            <p className="mt-2 text-5xl font-black tracking-[-0.06em] text-slate-800">{formatCurrency(session.paymentAmount)}</p>
            <p className="text-base font-semibold text-slate-400">{itemLabel}</p>
          </SectionCard>
          <QrPlaceholder code={session.qrId} />
          <div className="space-y-2 text-center">
            <p className="text-3xl font-black tracking-[-0.05em] text-slate-800">QR 스캔 대기중</p>
            <p className="text-base font-bold text-slate-500">남은 시간 {remaining}</p>
          </div>
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              {error}
            </p>
          ) : null}
          <PaymentSummary
            amount={session.paymentAmount}
            merchant={session.marketName}
            floating={false}
            secondaryLabel="결제 취소"
            onSecondary={async () => {
              const canceled = await cancelPaymentSession(session.qrId)
              setActivePayment(canceled)
              navigate(`/user/payment/result?qrId=${canceled.qrId}`, { replace: true })
            }}
          />
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
