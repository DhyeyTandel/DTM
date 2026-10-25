import { expect, test } from 'vitest'
import { categoryLabel } from './categories'

test('a category is shown with a capital, and SUV and EV in full capitals', () => {
  expect(categoryLabel('sedan')).toBe('Sedan')
  expect(categoryLabel('suv')).toBe('SUV')
  expect(categoryLabel('ev')).toBe('EV')
})
