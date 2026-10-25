export type StockStatus = 'in-stock' | 'low' | 'sold-out'

export const LOW_STOCK_MAX = 3
export const OUT_OF_STOCK_LABEL = 'Out of stock'
const SOLD_OUT_LABEL = 'Sold out'

export function stockStatus(quantity: number): StockStatus {
  if (quantity === 0) return 'sold-out'
  return quantity <= LOW_STOCK_MAX ? 'low' : 'in-stock'
}

export function isSoldOut(quantity: number): boolean {
  return stockStatus(quantity) === 'sold-out'
}

export function stockLabel(quantity: number): string {
  if (isSoldOut(quantity)) return SOLD_OUT_LABEL
  return stockStatus(quantity) === 'low' ? `${String(quantity)} left` : 'In stock'
}
