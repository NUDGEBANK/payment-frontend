import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchPaymentSession } from '../../api/userApi'
import { formatCurrency } from '../../api/mockClient'
import { StatusTimeline } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'

const statusText: Record<string, string> = {
  WAITING: 'QR 스캔 대기 중',
  SCANNED: '결제 승인 대기 중',
  APPROVED: '승인 완료, 결제 마무리 중',
  COMPLETED: '결제가 완료되었습니다.',
  REJECTED: '결제가 거절되었습니다.',
  CANCELLED: '결제가 취소되었습니다.',
}

export function PaymentProgressPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('paymentId') ?? ''
  const [session, setSession] = useState<PaymentSession | null>(null)

  useEffect(() => {
    if (!paymentId) {
      return
    }

    const sync = async () => {
      const data = await fetchPaymentSession(paymentId)
      setSession(data)
      if (data && ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(data.status)) {
        navigate(`/user/payment/result?paymentId=${data.id}`, { replace: true })
      }
    }

    sync()
    const timer = window.setInterval(sync, 1500)
    return () => window.clearInterval(timer)
  }, [navigate, paymentId])

  if (!session) {
    return null
  }

  return (
    <AppFrame>
      <PageHeader title="결제 승인 진행" backTo={`/user/payment/qr?paymentId=${session.id}`} />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className="mx-auto h-2 w-2 rounded-full bg-blue-600" />
            <div className="mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-[28px] border border-blue-100 bg-blue-50 text-5xl">
              💳
            </div>
            <h2 className="mt-8 text-4xl font-black tracking-[-0.05em] text-slate-800">
              {session.status === 'WAITING' ? '결제 처리 중...' : statusText[session.status]}
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              안전한 결제를 위해 승인 정보를 확인하고 있습니다.
            </p>
          </SectionCard>
          <SectionCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-bold text-slate-400">
                <span>처리 상태</span>
                <span className="text-blue-600">{statusText[session.status]}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-base font-bold text-slate-400">결제 금액</span>
                <span className="text-3xl font-black text-slate-800">{formatCurrency(session.amount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-base font-bold text-slate-400">가맹점</span>
                <span className="text-lg font-black text-slate-700">{session.merchantName}</span>
              </div>
            </div>
          </SectionCard>
          <StatusTimeline status={session.status} />
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
