import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '../../api/mockClient'
import { fetchPaymentSession } from '../../api/userApi'
import { AppFrame, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'

export function TerminalResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qrId = searchParams.get('qrId') ?? ''
  const reason = searchParams.get('reason') ?? ''
  const [session, setSession] = useState<PaymentSession | null>(null)

  useEffect(() => {
    if (!qrId) {
      navigate('/terminal/scan', { replace: true })
      return
    }

    fetchPaymentSession(qrId).then(setSession)
  }, [navigate, qrId])

  if (!session) {
    return (
      <AppFrame>
        <PageHeader title="결제 결과" backTo="/terminal/scan" />
        <Content>
          <SectionCard className="text-center">
            <p className="text-base font-semibold text-slate-500">결제 결과를 불러오는 중입니다.</p>
          </SectionCard>
        </Content>
      </AppFrame>
    )
  }

  const success = session.status === 'APPROVED'
  const description = reason || session.message || (success ? '결제가 승인되었습니다.' : '결제가 거절되었습니다.')

  return (
    <AppFrame>
      <PageHeader title="결제 결과" backTo="/terminal/scan" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] text-4xl ${
              success ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
            }`}>
              {success ? '승' : '거'}
            </div>
            <h2 className="mt-6 text-5xl font-black tracking-[-0.05em] text-slate-800">
              {success ? '결제 승인 완료' : '결제 거절 완료'}
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-400">{description}</p>
          </SectionCard>
          <SectionCard>
            <p className="text-sm font-black tracking-[0.18em] text-blue-600">TRANSACTION RECEIPT</p>
            <h3 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-800">
              {session.menuName}
            </h3>
            <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-400">결제 금액</span>
                <span className="text-4xl font-black text-slate-800">{formatCurrency(session.paymentAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-400">상태</span>
                <span className={`text-2xl font-black ${success ? 'text-blue-600' : 'text-rose-500'}`}>
                  {session.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-dashed border-slate-200 pt-5">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-400">처리 시각</p>
                  <p className="text-lg font-black text-slate-700">{formatDateTime(session.changedAt ?? session.requestedAt)}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-400">QR ID</p>
                  <p className="truncate text-lg font-black text-slate-700">{session.qrId}</p>
                </div>
              </div>
            </div>
          </SectionCard>
          <PrimaryButton className="w-full" onClick={() => navigate('/terminal')}>
            다음 스캔하기
          </PrimaryButton>
        </div>
      </Content>
    </AppFrame>
  )
}
