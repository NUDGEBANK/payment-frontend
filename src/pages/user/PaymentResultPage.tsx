import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '../../api/mockClient'
import { fetchPaymentSession, fetchRegisteredCard } from '../../api/userApi'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession, RegisteredCard } from '../../types/payment'

export function PaymentResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('paymentId') ?? ''
  const [session, setSession] = useState<PaymentSession | null>(null)
  const [card, setCard] = useState<RegisteredCard | null>(null)

  useEffect(() => {
    if (!paymentId) {
      navigate('/user/shop', { replace: true })
      return
    }
    fetchPaymentSession(paymentId).then(setSession)
    fetchRegisteredCard().then(setCard)
  }, [navigate, paymentId])

  if (!session) {
    return null
  }

  const success = session.status === 'COMPLETED'

  return (
    <AppFrame>
      <PageHeader title="결제 결과" backTo="/user/shop" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] text-4xl ${
              success ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-500'
            }`}>
              {success ? '✓' : '✕'}
            </div>
            <h2 className="mt-6 text-5xl font-black tracking-[-0.05em] text-slate-800">
              {success ? '결제 완료' : '결제 실패'}
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              {success ? '요청하신 결제가 성공적으로 처리되었습니다.' : '결제가 정상 처리되지 않았습니다.'}
            </p>
          </SectionCard>
          <SectionCard>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-400">결제 일시</span>
                <span className="text-lg font-black text-slate-700">
                  {formatDateTime(session.approvedAt ?? session.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-base font-bold text-slate-400">결제 상품</span>
                <span className="text-lg font-black text-slate-700">
                  {session.lines[0]?.name}
                  {session.lines.length > 1 ? ` 외 ${session.lines.length - 1}건` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-base font-bold text-slate-400">결제 금액</span>
                <span className="text-4xl font-black text-blue-600">{formatCurrency(session.amount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-base font-bold text-slate-400">카드 잔액</span>
                <span className="text-2xl font-black text-slate-700">
                  {card ? formatCurrency(card.balance) : '-'}
                </span>
              </div>
            </div>
          </SectionCard>
          <PrimaryButton className="w-full" onClick={() => navigate('/user/history')}>
            상세 영수증 보기
          </PrimaryButton>
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
