import { useEffect, useId, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import QRCode from 'qrcode'
import { formatCurrency, formatDateTime } from '../api/mockClient'
import type { PaymentSession, TransactionItem } from '../types/payment'
import { CheckIcon, CloseIcon } from './icons'
import { PrimaryButton, SecondaryButton, SectionCard } from './ui'

export function CardVisual({
  balance,
  numberMasked,
}: {
  alias: string
  balance: number
  numberMasked: string
}) {
  return (
    <SectionCard className="bg-[linear-gradient(135deg,_#e0f2fe,_#eff6ff_58%,_#e2e8f0)]">
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-500">현재 잔액</p>
        <p className="text-3xl font-black tracking-[-0.05em] text-slate-800">{formatCurrency(balance)}</p>
        <p className="text-sm font-semibold text-slate-500">{numberMasked}</p>
      </div>
    </SectionCard>
  )
}

export function ProductCard({
  product,
  quantity,
  onChange,
}: {
  product: { id: string; name: string; price: number; image?: string }
  quantity: number
  onChange: (next: number) => void
}) {
  return (
    <article className="overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)]">
      {product.image ? (
        <img src={product.image} alt={product.name} className="h-36 w-full rounded-[18px] object-cover" />
      ) : (
        <div className="flex h-36 w-full items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,_#dbeafe,_#eff6ff)] text-lg font-black text-slate-600">
          {product.name}
        </div>
      )}
      <div className="mt-4">
        <h3 className="text-xl font-extrabold tracking-[-0.03em] text-slate-800">{product.name}</h3>
        <p className="mt-1 text-2xl font-black text-blue-600">{formatCurrency(product.price)}</p>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-2">
        <button type="button" className="text-3xl text-slate-400" onClick={() => onChange(Math.max(quantity - 1, 0))}>-</button>
        <span className="text-lg font-black text-slate-700">{quantity}</span>
        <button type="button" className="text-3xl text-blue-600" onClick={() => onChange(quantity + 1)}>+</button>
      </div>
    </article>
  )
}

export function PaymentSummary({
  amount,
  merchant,
  onPrimary,
  primaryLabel,
  onSecondary,
  secondaryLabel,
  floating = true,
}: {
  amount: number
  merchant: string
  onPrimary?: () => void
  primaryLabel?: string
  onSecondary?: () => void
  secondaryLabel?: string
  floating?: boolean
}) {
  return (
    <div
      className={`mt-6 rounded-[26px] bg-[#e6f0f8] p-4 ${
        floating ? 'sticky bottom-0 shadow-[0_-6px_20px_rgba(148,163,184,0.18)]' : 'shadow-[0_10px_30px_rgba(148,163,184,0.16)]'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-400">총 결제 금액</p>
          <p className="text-3xl font-black tracking-[-0.05em] text-slate-800">{formatCurrency(amount)}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{merchant}</p>
        </div>
        <div className="flex gap-2">
          {secondaryLabel && onSecondary ? (
            <SecondaryButton onClick={onSecondary}>{secondaryLabel}</SecondaryButton>
          ) : null}
          {primaryLabel && onPrimary ? <PrimaryButton onClick={onPrimary}>{primaryLabel}</PrimaryButton> : null}
        </div>
      </div>
    </div>
  )
}

export function QrPlaceholder({ code }: { code: string }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    QRCode.toDataURL(code, {
      margin: 2,
      width: 360,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    }).then(setSrc)
  }, [code])

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-[20px] border-2 border-blue-200 bg-blue-50 p-3">
        {src ? <img src={src} alt="payment qr code" className="h-full w-full rounded-xl" /> : null}
      </div>
    </div>
  )
}

export function ScannerPreview({
  hasPayment,
  onDetected,
}: {
  hasPayment: boolean
  onDetected: (decodedText: string) => void
}) {
  const scannerId = useId().replace(/[:]/g, '')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isSecure =
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  const supportsCamera = Boolean(navigator.mediaDevices?.getUserMedia)
  const initialCameraState: 'idle' | 'requesting' | 'ready' | 'blocked' | 'unsupported' | 'insecure' =
    !supportsCamera ? 'unsupported' : !isSecure ? 'insecure' : 'idle'
  const [cameraState, setCameraState] = useState<
    'idle' | 'requesting' | 'ready' | 'blocked' | 'unsupported' | 'insecure'
  >(initialCameraState)
  const [, setScanState] = useState('SCANNER_IDLE')
  const [lastDecoded, setLastDecoded] = useState('')

  useEffect(() => {
    if (initialCameraState !== 'idle') {
      return
    }

    let cancelled = false

    const startCamera = async () => {
      try {
        setCameraState('requesting')
        setScanState('SCANNER_STARTING')
        const scanner = new Html5Qrcode(scannerId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (!cancelled) {
              setLastDecoded(decodedText)
              setScanState('SCAN_SUCCESS')
              onDetected(decodedText)
            }
          },
          (errorMessage) => {
            if (!cancelled && !lastDecoded) {
              setScanState(errorMessage.includes('NotFound') ? 'SCANNING' : 'SCANNING_ACTIVE')
            }
          },
        )

        if (!cancelled) {
          setCameraState('ready')
          setScanState('SCANNING')
        }
      } catch {
        setCameraState('blocked')
        setScanState('SCANNER_ERROR')
      }
    }

    startCamera()

    return () => {
      cancelled = true
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner?.isScanning) {
        scanner
          .stop()
          .then(() => {
            scanner.clear()
          })
          .catch(() => undefined)
      } else if (scanner) {
        scanner.clear()
      }
    }
  }, [initialCameraState, lastDecoded, onDetected, scannerId])

  const helperText =
    cameraState === 'insecure'
      ? '카메라는 HTTPS 또는 localhost에서만 동작합니다.'
      : cameraState === 'requesting'
        ? '카메라 권한을 요청하고 있습니다.'
        : cameraState === 'blocked'
          ? '카메라 권한이 없거나 사용할 수 없습니다.'
          : cameraState === 'unsupported'
            ? '이 브라우저는 카메라 미리보기를 지원하지 않습니다.'
            : hasPayment
              ? '프레임 안에 QR 코드를 맞춰주세요.'
              : '스캔 가능한 결제를 기다리는 중입니다.'

  return (
    <div className="rounded-[30px] bg-[linear-gradient(180deg,_#a7c8f7,_#c7edf9)] px-6 py-10 text-center">
      <div className="relative mx-auto h-[340px] w-full overflow-hidden rounded-[26px] border border-white/20 bg-slate-900/20">
        <div id={scannerId} className="absolute inset-0 z-0 h-full w-full overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover [&_video]:rounded-[26px]" />
        {cameraState !== 'ready' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 px-6 text-center text-sm font-bold text-white/85">
            {cameraState === 'insecure'
              ? '보안 연결이 아니어서 카메라를 열 수 없습니다.'
              : cameraState === 'requesting'
                ? '카메라를 여는 중입니다.'
                : cameraState === 'blocked'
                  ? '카메라 권한 허용 후 다시 시도해주세요.'
                  : cameraState === 'unsupported'
                    ? '카메라 미리보기를 지원하지 않는 환경입니다.'
                    : '카메라를 준비하는 중입니다.'}
          </div>
        ) : null}
        <div className="absolute inset-10 z-10 rounded-[30px] border-0">
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-blue-400" />
        </div>
      </div>
      <p className="mt-8 text-2xl font-black tracking-[-0.04em] text-white">사용자 QR 코드를 스캔하세요</p>
      <p className="mx-auto mt-3 inline-flex rounded-full bg-slate-800/45 px-4 py-2 text-sm font-semibold text-white/80">
        {helperText}
      </p>
    </div>
  )
}

export function StatusTimeline({ status }: { status: PaymentSession['status'] }) {
  const steps = [
    { key: 'CREATED', label: '결제 요청 생성' },
    { key: 'SCANNED', label: 'QR 스캔 완료' },
    { key: 'APPROVED', label: '결제 승인 완료' },
  ] satisfies Array<{ key: PaymentSession['status']; label: string }>
  const order: PaymentSession['status'][] = ['CREATED', 'SCANNED', 'APPROVED']
  const currentIndex = Math.max(order.indexOf(status), 0)

  return (
    <SectionCard className="bg-slate-50">
      <p className="mb-4 text-sm font-bold text-slate-500">결제 프로세스</p>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const rejected = ['REJECTED', 'CANCELED', 'EXPIRED'].includes(status)
          const done = !rejected && index <= currentIndex

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${
                  rejected
                    ? 'bg-rose-100 text-rose-500'
                    : done
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 bg-white text-slate-400'
                }`}
              >
                {rejected ? <CloseIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
              </div>
              <p className={`font-bold ${done ? 'text-blue-600' : rejected ? 'text-rose-500' : 'text-slate-400'}`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

export function TransactionList({ items }: { items: TransactionItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.transactionId} className="flex items-center justify-between rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
          <div>
            <p className="text-lg font-black tracking-[-0.04em] text-slate-800">{item.marketName}</p>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              {formatDateTime(item.transactionDatetime)}
            </p>
          </div>
          <p className="text-lg font-black text-slate-700">
            {item.menuName === "소비분석 대출" ? '+' : '-'}{formatCurrency(item.amount)}
          </p>
        </article>
      ))}
    </div>
  )
}
