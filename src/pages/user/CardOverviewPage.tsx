import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { clearRegisteredCard } from '../../api/userApi'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { CardVisual } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PrimaryButton, SecondaryButton } from '../../components/ui'

export function CardOverviewPage() {
  const navigate = useNavigate()
  const { card, setCard, refreshCard } = useUserApp()

  useEffect(() => {
    void refreshCard()
  }, [refreshCard])

  if (!card) {
    return <Navigate to="/user/register" replace />
  }

  return (
    <AppFrame>
      <PageHeader title="카드" backTo="/user" />
      <Content>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-black tracking-[0.24em] text-slate-400">REGISTERED CARD</p>
            <h2 className="mt-3 text-5xl font-black tracking-[-0.05em] text-slate-800">{card.alias}</h2>
          </div>
          <CardVisual alias={card.alias} balance={card.balance} numberMasked={card.numberMasked} />
          <PrimaryButton className="w-full" onClick={() => navigate('/user/shop')}>
            결제하러 가기
          </PrimaryButton>
          <SecondaryButton
            className="w-full"
            onClick={async () => {
              await clearRegisteredCard()
              setCard(null)
              navigate('/user/register')
            }}
          >
            카드 변경
          </SecondaryButton>
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
