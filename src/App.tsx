import { Navigate, Route, Routes } from 'react-router-dom'
import { UserAppProvider } from './app/providers/UserAppProvider'
import { LandingPage } from './pages/LandingPage'
import { TerminalDecisionPage } from './pages/terminal/TerminalDecisionPage'
import { TerminalProgressPage } from './pages/terminal/TerminalProgressPage'
import { TerminalResultPage } from './pages/terminal/TerminalResultPage'
import { TerminalScanPage } from './pages/terminal/TerminalScanPage'
import { CardOverviewPage } from './pages/user/CardOverviewPage'
import { CardRegisterPage } from './pages/user/CardRegisterPage'
import { HistoryPage } from './pages/user/HistoryPage'
import { PaymentProgressPage } from './pages/user/PaymentProgressPage'
import { PaymentQrPage } from './pages/user/PaymentQrPage'
import { PaymentResultPage } from './pages/user/PaymentResultPage'
import { ShopPage } from './pages/user/ShopPage'
import { UserHomePage } from './pages/user/UserHomePage'

function App() {
  return (
    <UserAppProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserHomePage />} />
        <Route path="/user/register" element={<CardRegisterPage />} />
        <Route path="/user/card" element={<CardOverviewPage />} />
        <Route path="/user/history" element={<HistoryPage />} />
        <Route path="/user/shop" element={<ShopPage />} />
        <Route path="/user/payment/qr" element={<PaymentQrPage />} />
        <Route path="/user/payment/progress" element={<PaymentProgressPage />} />
        <Route path="/user/payment/result" element={<PaymentResultPage />} />
        <Route path="/terminal" element={<Navigate to="/terminal/scan" replace />} />
        <Route path="/terminal/scan" element={<TerminalScanPage />} />
        <Route path="/terminal/decision" element={<TerminalDecisionPage />} />
        <Route path="/terminal/progress" element={<TerminalProgressPage />} />
        <Route path="/terminal/result" element={<TerminalResultPage />} />
      </Routes>
    </UserAppProvider>
  )
}

export default App
