import { useEffect, useState } from 'react'
import { formatCurrency } from '../../api/mockClient'
import { fetchTransactions } from '../../api/userApi'
import { TransactionList } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PillButton, SectionCard } from '../../components/ui'
import type { DateFilterPreset, TransactionItem } from '../../types/payment'

const presets: { key: DateFilterPreset; label: string }[] = [
  { key: '1M', label: '1개월' },
  { key: '3M', label: '3개월' },
  { key: '6M', label: '6개월' },
  { key: '1Y', label: '1년' },
  { key: 'CUSTOM', label: '직접 선택' },
]

export function HistoryPage() {
  const [preset, setPreset] = useState<DateFilterPreset>('1M')
  const [items, setItems] = useState<TransactionItem[]>([])

  useEffect(() => {
    fetchTransactions({ preset }).then(setItems)
  }, [preset])

  const monthSpend = items
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0)

  return (
    <AppFrame>
      <PageHeader title="결제 내역" backTo="/user" />
      <Content>
        <SectionCard className="bg-[linear-gradient(135deg,_#edf6ff,_#eff6ff)]">
          <p className="text-sm font-bold text-slate-500">이번 달 총 지출</p>
          <p className="mt-2 text-5xl font-black tracking-[-0.05em] text-slate-800">{formatCurrency(monthSpend)}</p>
          <div className="mt-5 flex items-center justify-between border-t border-white/70 pt-4">
            <p className="text-sm font-bold text-blue-500">지난달 대비 +12%</p>
            <p className="text-sm font-black text-blue-600">분석 보기</p>
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
