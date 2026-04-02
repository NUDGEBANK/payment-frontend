import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { formatCurrency } from '../../api/mockClient'
import { approvePayment, rejectPayment } from '../../api/terminalApi'
import { fetchPaymentSession } from '../../api/userApi'
import { AppFrame, Content, PageHeader, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'

export function TerminalProgressPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qrId = searchParams.get('qrId') ?? ''
  const action = searchParams.get('action') ?? 'approve'
  const [session, setSession] = useState<PaymentSession | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!qrId) {
        navigate('/terminal/scan', { replace: true })
        return
      }

      try {
        const current = await fetchPaymentSession(qrId)
        if (!cancelled) {
          setSession(current)
        }

        const updated = action === 'approve'
          ? await approvePayment(qrId)
          : await rejectPayment(qrId)

        if (!cancelled) {
          setSession(updated)
          window.setTimeout(() => {
            navigate(`/terminal/result?qrId=${updated.qrId}`, { replace: true })
          }, 1200)
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof ApiError ? caught.code : '결제 처리 실패')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [action, navigate, qrId])

  if (!session && !error) {
    return (
      <AppFrame>
        <PageHeader title="결제 진행" backTo="/terminal/scan" />
        <Content>
          <SectionCard className="text-center">
            <p className="text-base font-semibold text-slate-500">결제 상태를 불러오는 중입니다.</p>
          </SectionCard>
        </Content>
      </AppFrame>
    )
  }

  const label = action === 'approve' ? '결제 승인 처리 중' : '결제 거절 처리 중'

  return (
    <AppFrame>
      <PageHeader title="결제 진행" backTo="/terminal/scan" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[30px] border border-blue-100 bg-white text-5xl shadow-[0_12px_24px_rgba(148,163,184,0.16)]">
              결
            </div>
            <h2 className="mt-8 text-5xl font-black tracking-[-0.05em] text-slate-800">{label}</h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              서버 응답을 기다리고 있습니다.
            </p>
            <div className="mt-8">
              <div className="flex items-center justify-between text-sm font-black tracking-[0.18em] text-slate-400">
                <span>REQUEST</span>
                <span>PROCESSING</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div className="h-2 w-4/5 rounded-full bg-blue-600" />
              </div>
            </div>
          </SectionCard>
          {session ? (
            <div className="grid grid-cols-2 gap-4">
              <SectionCard className="bg-slate-50">
                <p className="text-xs font-black tracking-[0.18em] text-slate-400">MARKET</p>
                <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-800">{session.marketName}</p>
              </SectionCard>
              <SectionCard className="bg-slate-50">
                <p className="text-xs font-black tracking-[0.18em] text-slate-400">AMOUNT</p>
                <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-800">{formatCurrency(session.paymentAmount)}</p>
              </SectionCard>
            </div>
          ) : null}
          {error ? (
            <SectionCard className="bg-rose-50 text-rose-600">
              <p className="text-sm font-bold">{error}</p>
            </SectionCard>
          ) : null}
        </div>
      </Content>
    </AppFrame>
  )
}
