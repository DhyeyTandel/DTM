import { stockLabel, stockStatus } from '../../lib/stock'

const KEY_RACK_MAX = 12
const EMPTY_HOOKS = 6

function KeyTag() {
  return (
    <svg viewBox="0 0 20 34" className="h-9 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2" y="9" width="16" height="23" rx="3" fill="currentColor" />
      <circle cx="10" cy="14" r="1.8" fill="var(--color-canvas)" />
    </svg>
  )
}

function EmptyHook() {
  return (
    <svg viewBox="0 0 20 34" className="h-9 w-5 shrink-0 text-ink-muted" aria-hidden="true">
      <circle cx="10" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function KeyRack({ quantity }: { quantity: number }) {
  const status = stockStatus(quantity)
  const shown = Math.min(quantity, KEY_RACK_MAX)
  const colour = status === 'low' ? 'text-low-fill' : 'text-ok'
  const label = status === 'in-stock' ? `${String(quantity)} in stock` : stockLabel(quantity)

  return (
    <div>
      <div className={`flex flex-wrap gap-1.5 ${colour}`}>
        {status === 'sold-out'
          ? Array.from({ length: EMPTY_HOOKS }, (_, index) => <EmptyHook key={index} />)
          : Array.from({ length: shown }, (_, index) => <KeyTag key={index} />)}
      </div>
      <p className={`mt-2 text-2xl font-bold ${status === 'sold-out' ? 'text-ink-muted' : ''}`}>
        {label}
      </p>
    </div>
  )
}
