import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Ban, Check, CircleAlert, CircleX, Clock3, type LucideIcon } from 'lucide-react'
import { formatCurrency, formatDateTime } from '../../api/mockClient'
import { fetchPaymentSession } from '../../api/userApi'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession, RegisteredCard } from '../../types/payment'

interface ResultCopy {
  icon: LucideIcon
  iconClassName: string
  title: string
  description: string
}

function getResultCopy(session: PaymentSession, reason: string): ResultCopy {
  const normalizedMessage = (reason || session.message || '').toLowerCase()

  switch (session.status) {
    case 'APPROVED':
      return {
        icon: Check,
        iconClassName: 'bg-blue-100 text-blue-600',
        title: '결제 완료',
        description: '결제가 정상 처리되었습니다.',
      }
    case 'CANCELED':
      return {
        icon: Ban,
        iconClassName: 'bg-rose-100 text-rose-500',
        title: '결제 취소',
        description: '결제가 취소되었습니다.',
      }
    case 'REJECTED':
      if (
        normalizedMessage.includes('잔액 부족') ||
        normalizedMessage.includes('insufficient_balance') ||
        normalizedMessage.includes('insufficient balance')
      ) {
        return {
          icon: CircleAlert,
          iconClassName: 'bg-amber-100 text-amber-600',
          title: '잔액 부족',
          description: '잔액이 부족합니다.',
        }
      }

      return {
        icon: CircleX,
        iconClassName: 'bg-rose-100 text-rose-500',
        title: '결제 거절',
        description: '결제가 거절되었습니다.',
      }
    case 'EXPIRED':
      return {
        icon: Clock3,
        iconClassName: 'bg-rose-100 text-rose-500',
        title: '결제 만료',
        description: '결제가 만료되었습니다.',
      }
    default:
      return {
        icon: CircleAlert,
        iconClassName: 'bg-slate-100 text-slate-500',
        title: '결제 종료',
        description: session.message ?? '결제가 완료되지 않았습니다.',
      }
  }
}

export function PaymentResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qrId = searchParams.get('qrId') ?? ''
  const reason = searchParams.get('reason') ?? ''
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

  const resultCopy = getResultCopy(session, reason)
  const ResultIcon = resultCopy.icon

  return (
    <AppFrame>
      <PageHeader title="결제 결과" backTo="/user/shop" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] text-4xl ${resultCopy.iconClassName}`}>
              <ResultIcon className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-5xl font-black tracking-[-0.05em] text-slate-800">
              {resultCopy.title}
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              {resultCopy.description}
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
