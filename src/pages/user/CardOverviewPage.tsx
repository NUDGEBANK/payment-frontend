import { Navigate, useNavigate } from 'react-router-dom'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { CardVisual } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton } from '../../components/ui'

export function CardOverviewPage() {
  const navigate = useNavigate()
  const { card } = useUserApp()

  if (!card) {
    return <Navigate to="/user/register" replace />
  }

  return (
    <AppFrame>
      <PageHeader title="카드" backTo="/" />
      <Content>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-black tracking-[0.24em] text-slate-400">ARCHITECTURAL PLAN 01</p>
            <h2 className="mt-3 text-5xl font-black tracking-[-0.05em] text-slate-800">{card.alias}</h2>
          </div>
          <CardVisual alias={card.alias} balance={card.balance} numberMasked={card.numberMasked} />
          <PrimaryButton className="w-full" onClick={() => navigate('/user/register')}>
            카드 변경
          </PrimaryButton>
          <p className="text-center text-sm font-semibold text-slate-300">
            안전한 금융 거래를 위해 입력하신 정보는 암호화되어 전송됩니다.
            <br />
            Architectural Security Protocol v2.4 Enabled
          </p>
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
