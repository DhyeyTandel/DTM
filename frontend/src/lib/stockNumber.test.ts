import { expect, test } from 'vitest'
import { formatStockNumber } from './stockNumber'

test('a stock number is the vehicle id padded to four digits after DTM-', () => {
  expect(formatStockNumber(12)).toBe('DTM-0012')
  expect(formatStockNumber(1)).toBe('DTM-0001')
  expect(formatStockNumber(12345)).toBe('DTM-12345')
})
