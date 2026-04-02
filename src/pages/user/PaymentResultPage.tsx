import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '../../api/mockClient'
import { fetchPaymentSession } from '../../api/userApi'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession, RegisteredCard } from '../../types/payment'

export function PaymentResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qrId = searchParams.get('qrId') ?? ''
  const { refreshCard } = useUserApp()
  const [session, setSession] = useState<PaymentSession | null>(null)
  const [card, setCard] = useState<RegisteredCard | null>(null)

  useEffect(() => {
    if (!qrId) {
      navigate('/user/shop', { replace: true })
      return
    }

    fetchPaymentSession(qrId).then(setSession)
    refreshCard().then(setCard)
  }, [navigate, qrId, refreshCard])

  if (!session) {
    return null
  }

  const success = session.status === 'APPROVED'

  return (
    <AppFrame>
      <PageHeader title="결제 결과" backTo="/user/shop" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] text-4xl ${
              success ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-500'
            }`}>
              {success ? '승' : '실'}
            </div>
            <h2 className="mt-6 text-5xl font-black tracking-[-0.05em] text-slate-800">
              {success ? '결제 완료' : '결제 종료'}
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              {session.message ?? (success ? '결제가 정상 처리되었습니다.' : '결제가 완료되지 않았습니다.')}
            </p>
          </SectionCard>
          <SectionCard>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-400">처리 시각</span>
                <span className="text-lg font-black text-slate-700">
                  {formatDateTime(session.changedAt ?? session.requestedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-base font-bold text-slate-400">결제 상품</span>
                <span className="text-lg font-black text-slate-700">
                  {session.menuName} {session.quantity}개
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-base font-bold text-slate-400">결제 금액</span>
                <span className="text-4xl font-black text-blue-600">{formatCurrency(session.paymentAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-base font-bold text-slate-400">현재 잔액</span>
                <span className="text-2xl font-black text-slate-700">
                  {card ? formatCurrency(card.balance) : '-'}
                </span>
              </div>
            </div>
          </SectionCard>
          <PrimaryButton className="w-full" onClick={() => navigate('/user/history')}>
            이용내역 보기
          </PrimaryButton>
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
