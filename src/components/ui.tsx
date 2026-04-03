import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowLeftIcon, CardIcon, QrIcon, ReceiptIcon, ShopIcon } from './icons'

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f8fbff_22%,_#eef4fb_58%,_#edf2f7_100%)] px-0 py-0 text-slate-800 sm:px-4 sm:py-6">
      <div className="mx-auto flex h-dvh w-full max-w-[410px] flex-col overflow-hidden bg-white/70 shadow-[0_25px_70px_rgba(51,65,85,0.16)] backdrop-blur sm:h-[min(100dvh-3rem,880px)] sm:rounded-[36px] sm:border sm:border-white/60">
        {children}
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  backTo,
  action,
}: {
  title: string
  backTo?: string
  action?: ReactNode
}) {
  return (
    <header className="flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-3">
        {backTo ? (
          <Link
            to={backTo}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        ) : (
          <div className="h-9 w-9" />
        )}
        <h1 className="text-[1.9rem] font-black tracking-[-0.04em] text-slate-800">{title}</h1>
      </div>
      {action}
    </header>
  )
}

export function Content({ children }: { children: ReactNode }) {
  return <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</main>
}

export function SectionCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(148,163,184,0.16)] ${className}`}>
      {children}
    </section>
  )
}

export function BottomNav({ terminal = false }: { terminal?: boolean }) {
  const items = terminal
    ? [{ to: '/terminal/scan', label: '스캔', icon: <QrIcon className="h-5 w-5" /> }]
    : [
        { to: '/user/card', label: '카드', icon: <CardIcon className="h-5 w-5" /> },
        { to: '/user/shop', label: '상품구매', icon: <ShopIcon className="h-5 w-5" /> },
        { to: '/user/history', label: '내역', icon: <ReceiptIcon className="h-5 w-5" /> },
      ]

  return (
    <nav className={`shrink-0 gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 ${terminal ? 'grid grid-cols-1' : 'grid grid-cols-3'}`}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold ${
              isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500'
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function PillButton({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold transition ${
        active
          ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.3)]'
          : 'bg-slate-100 text-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={`rounded-[18px] bg-blue-600 px-5 py-4 text-base font-bold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={`rounded-[18px] bg-slate-100 px-5 py-4 text-base font-bold text-slate-700 transition enabled:hover:bg-slate-200 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-800 outline-none placeholder:text-slate-300 focus:border-blue-400"
    />
  )
}
