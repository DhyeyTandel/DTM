import { expect, test } from 'vitest'
import type { Vehicle } from '../api/types'
import { DEFAULT_LISTING_PARAMS, filterVehicles, sortVehicles } from './listing'

function vehicle(changes: Partial<Vehicle>): Vehicle {
  return {
    id: 1,
    make: 'Toyota',
    model: 'Corolla',
    category: 'sedan',
    price: 15_00_000_00,
    quantity: 5,
    image_url: null,
    ...changes,
  }
}

const inStock = vehicle({ id: 1, quantity: 12 })
const low = vehicle({ id: 2, quantity: 2, category: 'suv', price: 38_00_000_00 })
const soldOut = vehicle({ id: 3, quantity: 0, category: 'hatchback', price: 7_50_000_00 })
const all = [inStock, low, soldOut]

test('the CURRENT tab lists every vehicle, sold out ones included', () => {
  expect(filterVehicles(all, { ...DEFAULT_LISTING_PARAMS, tab: 'current' })).toEqual(all)
})

test('the SOLD OUT tab lists only vehicles at zero stock', () => {
  expect(filterVehicles(all, { ...DEFAULT_LISTING_PARAMS, tab: 'sold-out' })).toEqual([soldOut])
})

test('a category filter keeps only that category', () => {
  expect(filterVehicles(all, { ...DEFAULT_LISTING_PARAMS, category: 'suv' })).toEqual([low])
})

test('a price range in rupees keeps vehicles inside it, ends included', () => {
  const params = { ...DEFAULT_LISTING_PARAMS, minPrice: '750000', maxPrice: '1500000' }

  expect(filterVehicles(all, params)).toEqual([inStock, soldOut])
})

test('an availability filter keeps only that stock status', () => {
  expect(filterVehicles(all, { ...DEFAULT_LISTING_PARAMS, availability: 'low' })).toEqual([low])
})

test('a price that is not a number is ignored', () => {
  expect(filterVehicles(all, { ...DEFAULT_LISTING_PARAMS, minPrice: 'abc' })).toEqual(all)
})

test('sort orders by price low to high, price high to low, or name', () => {
  expect(sortVehicles(all, 'price-asc')).toEqual([soldOut, inStock, low])
  expect(sortVehicles(all, 'price-desc')).toEqual([low, inStock, soldOut])
  const honda = vehicle({ id: 4, make: 'Honda', model: 'City' })
  expect(sortVehicles([inStock, honda], 'name')).toEqual([honda, inStock])
})

test('no sort leaves the order as it came', () => {
  expect(sortVehicles(all, '')).toEqual(all)
})
