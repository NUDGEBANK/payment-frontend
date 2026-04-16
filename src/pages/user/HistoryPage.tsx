import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { formatCurrency } from '../../api/mockClient'
import { fetchHistorySummary, fetchTransactions } from '../../api/userApi'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { TransactionList } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PillButton, SectionCard } from '../../components/ui'
import type { CardHistorySummary, DateFilterPreset, TransactionItem } from '../../types/payment'

const presets: { key: DateFilterPreset; label: string }[] = [
  { key: 'ONE_MONTH', label: '1개월' },
  { key: 'THREE_MONTHS', label: '3개월' },
  { key: 'SIX_MONTHS', label: '6개월' },
  { key: 'ONE_YEAR', label: '1년' },
]

export function HistoryPage() {
  const { card } = useUserApp()
  const [preset, setPreset] = useState<DateFilterPreset>('ONE_MONTH')
  const [summary, setSummary] = useState<CardHistorySummary | null>(null)
  const [items, setItems] = useState<TransactionItem[]>([])

  useEffect(() => {
    if (!card) {
      return
    }

    fetchHistorySummary(card.cardId).then(setSummary)
  }, [card])

  useEffect(() => {
    if (!card) {
      return
    }

    fetchTransactions({ cardId: card.cardId, preset }).then((response) => {
      setItems(response.transactions)
    })
  }, [card, preset])

  if (!card) {
    return <Navigate to="/user/register" replace />
  }

  return (
    <AppFrame>
      <PageHeader title="결제 내역" backTo="/user" />
      <Content>
        <SectionCard className="bg-[linear-gradient(135deg,_#edf6ff,_#eff6ff)]">
          <p className="text-sm font-bold text-slate-500">이번 달 총 지출</p>
          <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-800">
            {formatCurrency(summary?.currentMonthSpending ?? 0)}
          </p>
          <div className="mt-5 flex items-center justify-between border-t border-white/70 pt-4">
            <p className="text-sm font-bold text-blue-500">
              전월 대비 {summary?.changeRatePercent == null ? '집계 불가' : `${summary.changeRatePercent}%`}
            </p>
            <p className="text-sm font-black text-blue-600">
              잔액 {formatCurrency(summary?.currentBalance ?? card.balance)}
            </p>
          </div>
        </SectionCard>
        <div className="mt-5 flex flex-wrap gap-2">
          {presets.map((item) => (
            <PillButton key={item.key} active={preset === item.key} onClick={() => setPreset(item.key)}>
              {item.label}
            </PillButton>
          ))}
        </div>
        <div className="mt-6">
          <TransactionList items={items} />
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
