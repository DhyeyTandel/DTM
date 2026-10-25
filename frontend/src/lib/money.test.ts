import { expect, test } from 'vitest'
import { formatPrice } from './money'

test('a price in paise is shown in rupees with Indian digit grouping', () => {
  expect(formatPrice(14_49_000_00)).toBe('₹14,49,000')
})

test('paise left over show two decimals and a whole rupee price shows none', () => {
  expect(formatPrice(14_49_000_50)).toBe('₹14,49,000.50')
  expect(formatPrice(5_00)).toBe('₹5')
})
