import { Link } from 'react-router-dom'
import { AppFrame, Content, PrimaryButton, SectionCard } from '../components/ui'

export function LandingPage() {
  return (
    <AppFrame>
      <Content>
        <div className="flex min-h-full flex-col justify-center py-10">
          <p className="text-3xl font-black tracking-[0.32em] text-blue-600 text-center">가상 결제 환경</p>
          <div className="mt-10 space-y-4">
            <SectionCard className="bg-[linear-gradient(135deg,_#dbeafe,_#eff6ff)]">
              <p className="text-sm font-bold text-slate-500">사용자용 웹앱</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-800">카드, 상품구매, QR 결제</h2>
              <Link to="/user">
                <PrimaryButton className="mt-6 w-full">사용자 앱 시작</PrimaryButton>
              </Link>
            </SectionCard>
            <SectionCard className="bg-[linear-gradient(135deg,_#eff6ff,_#e2e8f0)]">
              <p className="text-sm font-bold text-slate-500">결제 단말기용 웹앱</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-800">QR 스캔, 승인/거절, 결과</h2>
              <Link to="/terminal">
                <PrimaryButton className="mt-6 w-full">단말기 앱 시작</PrimaryButton>
              </Link>
            </SectionCard>
          </div>
        </div>
      </Content>
    </AppFrame>
  )
}
