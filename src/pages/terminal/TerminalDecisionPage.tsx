import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency, parsePaymentQrPayload } from '../../api/mockClient'
import { fetchPaymentSession } from '../../api/userApi'
import { AppFrame, Content, PageHeader, PrimaryButton, SecondaryButton, SectionCard } from '../../components/ui'
import type { PaymentSession } from '../../types/payment'
import { buildDemoSession } from './demoSession'

export function TerminalDecisionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('paymentId') ?? parsePaymentQrPayload(searchParams.get('payload') ?? '') ?? ''
  const payload = searchParams.get('payload') ?? ''
  const [session, setSession] = useState<PaymentSession | null>(null)

  useEffect(() => {
    if (!paymentId && !payload) {
      navigate('/terminal/scan', { replace: true })
      return
    }

    if (paymentId) {
      fetchPaymentSession(paymentId).then((data) => {
        if (data) {
          setSession(data)
          return
        }

        if (payload) {
          setSession(buildDemoSession(payload, 'SCANNED'))
          return
        }

        navigate('/terminal/scan', { replace: true })
      })
      return
    }

    setSession(buildDemoSession(payload, 'SCANNED'))
  }, [navigate, paymentId, payload])

  if (!session) {
    return (
      <AppFrame>
        <PageHeader title="승인 요청 확인" backTo="/terminal/scan" />
        <Content>
          <SectionCard className="text-center">
            <p className="text-base font-semibold text-slate-500">스캔한 결제 정보를 불러오는 중입니다.</p>
          </SectionCard>
        </Content>
      </AppFrame>
    )
  }

  return (
    <AppFrame>
      <PageHeader title="승인 요청 확인" backTo="/terminal/scan" />
      <Content>
        <div className="space-y-6">
          <SectionCard className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-blue-200 bg-blue-50 text-4xl text-blue-600">
              🧾
            </div>
            <h2 className="mt-8 text-5xl font-black tracking-[-0.05em] text-slate-800">결제 승인 요청</h2>
            <p className="mt-3 text-base font-semibold text-slate-400">
              결제 상세 정보를 확인하고 승인 여부를 결정해주세요.
            </p>
          </SectionCard>
          <SectionCard>
            <p className="text-sm font-bold text-slate-400">결제 금액</p>
            <p className="mt-2 text-5xl font-black tracking-[-0.05em] text-blue-600">
              {formatCurrency(session.amount)}
            </p>
          </SectionCard>
          <SectionCard className="bg-slate-50">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-400">주문 상품</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-800">
                  {session.lines[0]?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                  <p className="text-sm font-bold text-slate-400">결제 수단</p>
                  <p className="mt-1 text-lg font-black text-slate-700">체크카드 (9402)</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">스캔 값</p>
                  <p className="mt-1 truncate text-lg font-black text-slate-700">
                    {paymentId || payload}
                  </p>
                </div>
              </div>
              <div className="rounded-[18px] bg-white p-4 text-sm font-semibold leading-6 text-slate-400">
                QR 문자열만 읽혀도 이 데모 흐름은 다음 단계로 진행됩니다.
              </div>
            </div>
          </SectionCard>
          <PrimaryButton
            className="w-full"
            onClick={() =>
              navigate(
                paymentId
                  ? `/terminal/progress?paymentId=${paymentId}&payload=${encodeURIComponent(payload || session.qrCode)}&action=approve`
                  : `/terminal/progress?payload=${encodeURIComponent(payload)}&action=approve`,
              )
            }
          >
            결제 승인
          </PrimaryButton>
          <SecondaryButton
            className="w-full"
            onClick={() =>
              navigate(
                paymentId
                  ? `/terminal/progress?paymentId=${paymentId}&payload=${encodeURIComponent(payload || session.qrCode)}&action=reject`
                  : `/terminal/progress?payload=${encodeURIComponent(payload)}&action=reject`,
              )
            }
          >
            결제 거절
          </SecondaryButton>
        </div>
      </Content>
    </AppFrame>
  )
}
