import { useNavigate } from 'react-router-dom'
import { AppFrame, Content, PrimaryButton, SectionCard } from '../../components/ui'

export function TerminalHomePage() {
  const navigate = useNavigate()

  return (
    <AppFrame>
      <Content>
        <div className="flex min-h-full flex-col justify-center space-y-6">
          <SectionCard className="bg-[linear-gradient(135deg,_#eff6ff,_#dbeafe)] text-center">
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-800">
              QR 코드를 스캔해 <br /> 결제를 처리합니다.
            </h2>
            <p className="mt-4 text-base font-semibold text-slate-500">
              사용자 앱에서 생성한 QR을 읽고 승인 또는 거절을 진행합니다.
            </p>
          </SectionCard>
          <PrimaryButton className="w-full" onClick={() => navigate('/terminal/scan')}>
            QR 스캔하기
          </PrimaryButton>
        </div>
      </Content>
    </AppFrame>
  )
}
