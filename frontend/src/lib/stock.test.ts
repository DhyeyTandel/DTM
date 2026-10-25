import { expect, test } from 'vitest'
import { stockLabel, stockStatus } from './stock'

test('stock above 3 is in stock, 1 to 3 is low and 0 is sold out', () => {
  expect(stockStatus(4)).toBe('in-stock')
  expect(stockStatus(3)).toBe('low')
  expect(stockStatus(1)).toBe('low')
  expect(stockStatus(0)).toBe('sold-out')
})

test('the stock label says what is left in plain words', () => {
  expect(stockLabel(12)).toBe('In stock')
  expect(stockLabel(3)).toBe('Only 3 left')
  expect(stockLabel(1)).toBe('Only 1 left')
  expect(stockLabel(0)).toBe('Out of stock')
})
