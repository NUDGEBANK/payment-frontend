import { Link } from 'react-router-dom'
import { AppFrame, Content, PrimaryButton, SectionCard } from '../components/ui'

export function LandingPage() {
  return (
    <AppFrame>
      <Content>
        <div className="flex min-h-full flex-col justify-center py-10">
          <p className="text-sm font-black tracking-[0.32em] text-blue-600">VIRTUAL PAYMENT</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.06em] text-slate-800">
            사용자 앱과
            <br />
            결제 단말기를
            <br />
            한 프로젝트로
          </h1>
          <p className="mt-5 text-base font-semibold leading-7 text-slate-500">
            React + TypeScript + Vite + Tailwind 구조로 mock 결제 흐름을 구성했습니다.
          </p>
          <div className="mt-10 space-y-4">
            <SectionCard className="bg-[linear-gradient(135deg,_#dbeafe,_#eff6ff)]">
              <p className="text-sm font-bold text-slate-500">사용자용 웹앱</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-800">카드, 상품구매, QR 결제</h2>
              <Link to="/user">
                <PrimaryButton className="mt-6 w-full">사용자 앱 시작</PrimaryButton>
              </Link>
            </SectionCard>
            <SectionCard className="bg-[linear-gradient(135deg,_#eff6ff,_#e2e8f0)]">
              <p className="text-sm font-bold text-slate-500">결제 단말기용 웹앱</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-800">QR 스캔, 승인/거절, 결과</h2>
              <Link to="/terminal/scan">
                <PrimaryButton className="mt-6 w-full">단말기 앱 시작</PrimaryButton>
              </Link>
            </SectionCard>
          </div>
        </div>
      </Content>
    </AppFrame>
  )
}
