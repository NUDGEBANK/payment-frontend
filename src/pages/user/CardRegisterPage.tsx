import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { registerCard } from '../../api/userApi'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { AppFrame, BottomNav, Content, Field, PageHeader, PrimaryButton, TextInput } from '../../components/ui'

export function CardRegisterPage() {
  const navigate = useNavigate()
  const { setCard } = useUserApp()
  const [form, setForm] = useState({
    cardNumber: '',
    exp: '',
    password: '',
    alias: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = Object.values(form).every(Boolean) && !submitting

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError('')
      const card = await registerCard(form)
      setCard(card)
      navigate('/user/card')
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.code)
      } else {
        setError('카드 인증에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleExpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/\D/g, '')
    const formattedValue = rawValue.length <= 2
      ? rawValue
      : `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}`

    setForm((current) => ({
      ...current,
      exp: formattedValue.substring(0, 5),
    }))
  }

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/\D/g, '')
    const formattedValue = rawValue
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')

    setForm((current) => ({
      ...current,
      cardNumber: formattedValue,
    }))
  }

  return (
    <AppFrame>
      <PageHeader title="카드 등록" backTo="/user" />
      <Content>
        <div className="space-y-6">
          <div>
            <h2 className="text-5xl font-black tracking-[-0.05em] text-slate-800">내 카드 등록</h2>
            <p className="mt-3 text-sm font-bold tracking-[0.24em] text-slate-400">BACKEND VERIFY</p>
          </div>
          <div className="space-y-4 rounded-[30px] bg-slate-50 p-5">
            <Field label="카드번호">
              <TextInput
                placeholder="0000 0000 0000 0000"
                value={form.cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                inputMode="numeric"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="유효기간 (MM/YY)">
                <TextInput
                  placeholder="MM/YY"
                  value={form.exp}
                  onChange={handleExpChange}
                  maxLength={5}
                />
              </Field>
              <Field label="비밀번호 (4자리)">
                <TextInput
                  type="password"
                  placeholder="••••"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  maxLength={4}
                  inputMode="numeric"
                />
              </Field>
            </div>
            <Field label="카드 별칭">
              <TextInput
                placeholder="예: 생활비 카드"
                value={form.alias}
                onChange={(event) => setForm((current) => ({ ...current, alias: event.target.value }))}
              />
            </Field>
          </div>
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              {error}
            </p>
          ) : null}
          <PrimaryButton className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? '인증 중...' : '카드 등록'}
          </PrimaryButton>
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
