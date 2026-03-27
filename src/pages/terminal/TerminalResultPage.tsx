import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '../../api/mockClient'
import { fetchPaymentSession } from '../../api/userApi'
import { AppFrame, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'
import { buildDemoSession } from './demoSession'

export function TerminalResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('paymentId') ?? ''
  const payload = searchParams.get('payload') ?? ''
  const action = searchParams.get('action') ?? 'approve'
  const [session, setSession] = useState<PaymentSession | null>(null)

  useEffect(() => {
    if (!paymentId && !payload) {
      navigate('/terminal/scan', { replace: true })
      return
    }

    if (paymentId) {
      fetchPaymentSession(paymentId).then(setSession)
      return
    }

    setSession(buildDemoSession(payload, action === 'approve' ? 'COMPLETED' : 'REJECTED'))
  }, [action, navigate, paymentId, payload])

  if (!session) {
    return null
  }

  const success = session.status === 'COMPLETED'

  return (
    <AppFrame>
      <PageHeader title="결제 완료 내역" backTo="/terminal/scan" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] text-4xl ${
              success ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
            }`}>
              {success ? '✓' : '✕'}
            </div>
            <h2 className="mt-6 text-5xl font-black tracking-[-0.05em] text-slate-800">
              {success ? '결제 승인 완료' : '결제 거절 완료'}
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              {success ? '성공적으로 처리가 완료되었습니다.' : '거절 처리로 주문이 종료되었습니다.'}
            </p>
          </SectionCard>
          <SectionCard>
            <p className="text-sm font-black tracking-[0.18em] text-blue-600">TRANSACTION RECEIPT</p>
            <h3 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-800">
              {session.lines[0]?.name}
            </h3>
            <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-400">결제 금액</span>
                <span className="text-4xl font-black text-slate-800">{formatCurrency(session.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-400">상태</span>
                <span className={`text-2xl font-black ${success ? 'text-blue-600' : 'text-rose-500'}`}>
                  {success ? '승인완료' : '거절완료'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-dashed border-slate-200 pt-5">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-400">결제 일시</p>
                  <p className="text-lg font-black text-slate-700">{formatDateTime(session.approvedAt ?? session.createdAt)}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-400">승인 번호</p>
                  <p className="text-lg font-black text-slate-700">{session.approvalCode ?? '-'}</p>
                </div>
              </div>
            </div>
          </SectionCard>
          <PrimaryButton className="w-full" onClick={() => navigate('/terminal/scan')}>
            다음 스캔하기
          </PrimaryButton>
        </div>
      </Content>
    </AppFrame>
  )
}
