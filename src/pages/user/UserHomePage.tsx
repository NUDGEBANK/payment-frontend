import { useNavigate } from 'react-router-dom'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { AppFrame, BottomNav, Content, PrimaryButton, SectionCard } from '../../components/ui'

export function UserHomePage() {
  const navigate = useNavigate()
  const { card, loading } = useUserApp()

  if (loading) {
    return null
  }

  return (
    <AppFrame>
      <Content>
        <div className="flex min-h-full flex-col justify-center space-y-6">
          <SectionCard className="bg-[linear-gradient(135deg,_#edf6ff,_#eff6ff)] text-center">
            <p className="text-sm font-black tracking-[0.22em] text-blue-500">USER APP</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-800">
              카드를 등록하고
              <br />
              상품을 구매하세요
            </h2>
            <p className="mt-4 text-base font-semibold text-slate-500">
              등록한 카드로 상품을 선택하고 QR 결제를 진행할 수 있습니다.
            </p>
          </SectionCard>
          <PrimaryButton className="w-full" onClick={() => navigate(card ? '/user/card' : '/user/register')}>
            {card ? '등록 카드 보기' : '카드 등록하기'}
          </PrimaryButton>
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
