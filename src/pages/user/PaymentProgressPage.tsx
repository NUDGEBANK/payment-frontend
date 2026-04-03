import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency } from '../../api/mockClient'
import { fetchPaymentSession } from '../../api/userApi'
import { StatusTimeline } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'
import { Loader2 } from 'lucide-react'

const statusText: Record<PaymentSession['status'], string> = {
  CREATED: 'QR 생성 완료',
  SCANNED: '결제 승인 대기 중',
  APPROVED: '결제가 승인되었습니다.',
  REJECTED: '결제가 거절되었습니다.',
  CANCELED: '결제가 취소되었습니다.',
  EXPIRED: '결제가 만료되었습니다.',
}

export function PaymentProgressPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qrId = searchParams.get('qrId') ?? ''
  const [session, setSession] = useState<PaymentSession | null>(null)

  useEffect(() => {
    if (!qrId) {
      return
    }

    const sync = async () => {
      const data = await fetchPaymentSession(qrId)
      setSession(data)
      if (['APPROVED', 'REJECTED', 'CANCELED', 'EXPIRED'].includes(data.status)) {
        const reason = data.message ? `&reason=${encodeURIComponent(data.message)}` : ''
        navigate(`/user/payment/result?qrId=${data.qrId}${reason}`, { replace: true })
      }
    }

    sync()
    const timer = window.setInterval(sync, 1500)
    return () => window.clearInterval(timer)
  }, [navigate, qrId])

  if (!session) {
    return null
  }

  return (
    <AppFrame>
      <PageHeader title="결제 진행" backTo={`/user/payment/qr?qrId=${session.qrId}`} />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className="mx-auto h-2 w-2 rounded-full bg-blue-600" />
            <div className="mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-[28px] border border-blue-100 bg-blue-50 text-5xl">
              <Loader2 className="animate-spin" />
            </div>
            <h2 className="mt-8 text-4xl font-black tracking-[-0.05em] text-slate-800">
              {statusText[session.status]}
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              단말 응답을 기다리고 있습니다.
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
                <span className="text-3xl font-black text-slate-800">{formatCurrency(session.paymentAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-base font-bold text-slate-400">가맹점</span>
                <span className="text-lg font-black text-slate-700">{session.marketName}</span>
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
