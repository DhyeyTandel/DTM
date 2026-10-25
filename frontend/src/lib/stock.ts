export const STOCK_STATUSES = ['in-stock', 'low', 'sold-out'] as const
export type StockStatus = (typeof STOCK_STATUSES)[number]

export const STATUS_NAMES: Record<StockStatus, string> = {
  'in-stock': 'In stock',
  low: 'Low stock',
  'sold-out': 'Sold out',
}

export const LOW_STOCK_MAX = 3
export const OUT_OF_STOCK_LABEL = 'Out of stock'

export function stockStatus(quantity: number): StockStatus {
  if (quantity === 0) return 'sold-out'
  return quantity <= LOW_STOCK_MAX ? 'low' : 'in-stock'
}

export function isSoldOut(quantity: number): boolean {
  return stockStatus(quantity) === 'sold-out'
}

export function stockLabel(quantity: number): string {
  const status = stockStatus(quantity)
  return status === 'low' ? `${String(quantity)} left` : STATUS_NAMES[status]
}
