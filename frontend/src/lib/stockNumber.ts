const STOCK_NUMBER_PREFIX = 'DTM-'
const STOCK_NUMBER_DIGITS = 4

export function formatStockNumber(vehicleId: number): string {
  return `${STOCK_NUMBER_PREFIX}${String(vehicleId).padStart(STOCK_NUMBER_DIGITS, '0')}`
}
