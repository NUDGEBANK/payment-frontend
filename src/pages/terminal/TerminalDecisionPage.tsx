import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency } from '../../api/mockClient'
import { fetchPaymentSession } from '../../api/userApi'
import { AppFrame, Content, PageHeader, PrimaryButton, SecondaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'

export function TerminalDecisionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qrId = searchParams.get('qrId') ?? ''
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
        <PageHeader title="결제 확인" backTo="/terminal/scan" />
        <Content>
          <SectionCard className="text-center">
            <p className="text-base font-semibold text-slate-500">결제 정보를 불러오는 중입니다.</p>
          </SectionCard>
        </Content>
      </AppFrame>
    )
  }

  return (
    <AppFrame>
      <PageHeader title="결제 확인" backTo="/terminal/scan" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-blue-200 bg-blue-50 text-4xl text-blue-600">
              QR
            </div>
            <h2 className="mt-8 text-5xl font-black tracking-[-0.05em] text-slate-800">결제 승인 요청</h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              결제 상세를 확인하고 승인 여부를 선택하세요.
            </p>
          </SectionCard>
          <SectionCard>
            <p className="text-sm font-bold text-slate-400">결제 금액</p>
            <p className="mt-2 text-5xl font-black tracking-[-0.05em] text-blue-600">
              {formatCurrency(session.paymentAmount)}
            </p>
          </SectionCard>
          <SectionCard className="bg-slate-50">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-400">주문 상품</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-800">
                  {session.menuName}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                  <p className="text-sm font-bold text-slate-400">가맹점</p>
                  <p className="mt-1 text-lg font-black text-slate-700">{session.marketName}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">QR ID</p>
                  <p className="mt-1 truncate text-lg font-black text-slate-700">{session.qrId}</p>
                </div>
              </div>
            </div>
          </SectionCard>
          <PrimaryButton
            className="w-full"
            onClick={() => navigate(`/terminal/progress?qrId=${session.qrId}&action=approve`)}
          >
            결제 승인
          </PrimaryButton>
          <SecondaryButton
            className="w-full"
            onClick={() => navigate(`/terminal/progress?qrId=${session.qrId}&action=reject`)}
          >
            결제 거절
          </SecondaryButton>
        </div>
      </Content>
    </AppFrame>
  )
}
