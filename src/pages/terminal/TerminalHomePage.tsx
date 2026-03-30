import { useNavigate } from 'react-router-dom'
import { AppFrame, Content, PageHeader, PrimaryButton, SectionCard } from '../../components/ui'

export function TerminalHomePage() {
  const navigate = useNavigate()

  return (
    <AppFrame>
      <Content>
        <div className="flex min-h-full flex-col justify-center space-y-6">
          <SectionCard className="bg-[linear-gradient(135deg,_#eff6ff,_#dbeafe)] text-center">
            <p className="text-sm font-black tracking-[0.22em] text-blue-500">TERMINAL</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-800">
              QR코드 스캔 단말기입니다.
            </h2>
            <p className="mt-4 text-base font-semibold text-slate-500">
              결제 QR을 스캔해 승인 또는 거절을 진행할 수 있습니다.
            </p>
          </SectionCard>
          <PrimaryButton className="w-full" onClick={() => navigate('/terminal/scan')}>
            QR스캔하기
          </PrimaryButton>
        </div>
      </Content>
    </AppFrame>
  )
}
