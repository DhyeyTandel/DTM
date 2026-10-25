export type StockStatus = 'in-stock' | 'low' | 'sold-out'

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
  if (isSoldOut(quantity)) return OUT_OF_STOCK_LABEL
  return stockStatus(quantity) === 'low' ? `Only ${String(quantity)} left` : 'In stock'
}
