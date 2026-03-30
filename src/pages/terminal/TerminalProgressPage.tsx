import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency, parsePaymentQrPayload } from '../../api/mockClient'
import { approvePayment, completePayment, rejectPayment } from '../../api/terminalApi'
import { fetchPaymentSession } from '../../api/userApi'
import { AppFrame, Content, PageHeader, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'
import { buildDemoSession } from './demoSession'

export function TerminalProgressPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('paymentId') ?? parsePaymentQrPayload(searchParams.get('payload') ?? '') ?? ''
  const payload = searchParams.get('payload') ?? ''
  const action = searchParams.get('action') ?? 'approve'
  const [session, setSession] = useState<PaymentSession | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!paymentId && !payload) {
        navigate('/terminal/scan', { replace: true })
        return
      }

      if (!paymentId) {
        const demoStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
        const demo = buildDemoSession(payload, demoStatus)
        setSession(demo)
        window.setTimeout(() => {
          navigate(`/terminal/result?payload=${encodeURIComponent(payload)}&action=${action}`, {
            replace: true,
          })
        }, 1200)
        return
      }

      let updated = await fetchPaymentSession(paymentId)
      if (!updated) {
        if (payload) {
          const demoStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
          const demo = buildDemoSession(payload, demoStatus)
          setSession(demo)
          window.setTimeout(() => {
            navigate(`/terminal/result?payload=${encodeURIComponent(payload)}&action=${action}`, {
              replace: true,
            })
          }, 1200)
          return
        }

        navigate('/terminal/scan', { replace: true })
        return
      }

      setSession(updated)

      if (action === 'approve') {
        updated = await approvePayment(paymentId)
        if (!cancelled) setSession(updated)
        await new Promise((resolve) => setTimeout(resolve, 1200))
        updated = await completePayment(paymentId)
      } else {
        updated = await rejectPayment(paymentId)
      }

      if (!cancelled) {
        setSession(updated)
        window.setTimeout(() => {
          navigate(
            `/terminal/result?paymentId=${paymentId}&payload=${encodeURIComponent(updated.qrCode)}&action=${action}`,
            { replace: true },
          )
        }, 1200)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [action, navigate, paymentId, payload])

  if (!session) {
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

  const label = action === 'approve' ? '결제 승인 대기 중' : '결제 거절 처리 중'

  return (
    <AppFrame>
      <PageHeader title="결제 진행" backTo="/terminal/scan" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[30px] border border-blue-100 bg-white text-5xl shadow-[0_12px_24px_rgba(148,163,184,0.16)]">
              💸
            </div>
            <h2 className="mt-8 text-5xl font-black tracking-[-0.05em] text-slate-800">{label}</h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              안전한 결제를 위해 정보를 확인하고 있습니다.
            </p>
            <div className="mt-8">
              <div className="flex items-center justify-between text-sm font-black tracking-[0.18em] text-slate-400">
                <span>REQUEST</span>
                <span>AUTHORIZING</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div className={`h-2 rounded-full bg-blue-600 ${action === 'approve' ? 'w-4/5' : 'w-full'}`} />
              </div>
              <p className="mt-3 text-sm font-bold text-blue-600">
                {action === 'approve' ? '결제 요청 중...' : '거절 처리 중...'}
              </p>
            </div>
          </SectionCard>
          <div className="grid grid-cols-2 gap-4">
            <SectionCard className="bg-slate-50">
              <p className="text-xs font-black tracking-[0.18em] text-slate-400">MERCHANT</p>
              <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-800">{session.merchantName}</p>
            </SectionCard>
            <SectionCard className="bg-slate-50">
              <p className="text-xs font-black tracking-[0.18em] text-slate-400">AMOUNT</p>
              <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-800">{formatCurrency(session.amount)}</p>
            </SectionCard>
          </div>
          <SectionCard className="flex items-center justify-between bg-[linear-gradient(135deg,_#edf6ff,_#eff6ff)]">
            <p className="text-base font-black text-slate-600">End-to-end encrypted session</p>
            <p className="text-sm font-black tracking-[0.18em] text-blue-600">SECURE</p>
          </SectionCard>
        </div>
      </Content>
    </AppFrame>
  )
}
