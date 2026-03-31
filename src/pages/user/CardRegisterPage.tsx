import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const canSubmit = Object.values(form).every(Boolean)

  const handleSubmit = async () => {
    const card = await registerCard(form)
    setCard(card)
    navigate('/user/card')
  }

  const handleExpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    // 1. 숫자만 남기기 (기존 입력값에서 숫자 외 제거)
    const rawValue = value.replace(/\D/g, "");

    // 2. 형식 맞추기 (2글자 초과 시 중간에 / 삽입)
    let formattedValue = "";
    if (rawValue.length <= 2) {
      formattedValue = rawValue;
    } else {
      formattedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}`;
    }

    // 3. 기존 setForm 로직 그대로 실행 (최대 5자)
    setForm((current) => ({
      ...current,
      exp: formattedValue.substring(0, 5),
    }));
  };

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 1. 숫자만 남기기
    const rawValue = event.target.value.replace(/\D/g, "");

    // 2. 4자리마다 공백 삽입 (정규식 활용)
    // 최대 16자리까지만 받기 위해 slice(0, 16) 추가
    const formattedValue = rawValue
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ");

    // 3. 상태 업데이트
    setForm((current) => ({
      ...current,
      cardNumber: formattedValue,
    }));
  };

  return (
    <AppFrame>
      <PageHeader title="카드 등록" backTo="/user" />
      <Content>
        <div className="space-y-6">
          <div>
            <h2 className="text-5xl font-black tracking-[-0.05em] text-slate-800">새 카드 등록</h2>
            <p className="mt-3 text-sm font-bold tracking-[0.24em] text-slate-400">ARCHITECTURAL PLAN 01</p>
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
                  maxLength={5} // 입력 글자수 제한
                />
              </Field>
              <Field label="비밀번호 (4자리)">
                <TextInput
                  type="password"
                  placeholder="••••"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  maxLength={4}
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
          <PrimaryButton className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
            카드 등록
          </PrimaryButton>
          <p className="text-center text-sm font-semibold text-slate-300">
            안전한 금융 거래를 위해 입력하신 정보는 암호화되어 전송됩니다.
            <br />
            Architectural Security Protocol v2.4 Enabled
          </p>
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
