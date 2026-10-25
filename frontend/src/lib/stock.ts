export type StockStatus = 'in-stock' | 'low' | 'sold-out'

export const LOW_STOCK_MAX = 3

export function stockStatus(quantity: number): StockStatus {
  if (quantity === 0) return 'sold-out'
  return quantity <= LOW_STOCK_MAX ? 'low' : 'in-stock'
}

export function stockLabel(quantity: number): string {
  const status = stockStatus(quantity)
  if (status === 'sold-out') return 'Out of stock'
  return status === 'low' ? `Only ${String(quantity)} left` : 'In stock'
}
