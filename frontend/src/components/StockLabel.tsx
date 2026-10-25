import { stockLabel, stockStatus, type StockStatus } from '../lib/stock'

const statusClasses: Record<StockStatus, string> = {
  'in-stock': 'text-ink',
  low: 'font-semibold text-low',
  'sold-out': 'text-ink-muted',
}

export function StockLabel({ quantity }: { quantity: number }) {
  return <p className={statusClasses[stockStatus(quantity)]}>{stockLabel(quantity)}</p>
}
