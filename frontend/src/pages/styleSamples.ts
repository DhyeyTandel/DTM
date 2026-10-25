import type { Vehicle } from '../api/types'

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 1,
    make: 'Honda',
    model: 'City',
    category: 'sedan',
    price: 14_49_000_00,
    quantity: 12,
    image_url: '/images/honda-city.jpg',
  },
  {
    id: 2,
    make: 'Toyota',
    model: 'Fortuner',
    category: 'suv',
    price: 38_21_000_00,
    quantity: 2,
    image_url: '/images/toyota-fortuner.jpg',
  },
  {
    id: 3,
    make: 'Maruti Suzuki',
    model: 'Swift',
    category: 'hatchback',
    price: 6_49_000_50,
    quantity: 0,
    image_url: '/images/maruti-swift.jpg',
  },
  {
    id: 4,
    make: 'Hyundai',
    model: 'i20',
    category: 'hatchback',
    price: 7_99_000_00,
    quantity: 5,
    image_url: null,
  },
]

export const PHOTOGRAPHED_SAMPLES = SAMPLE_VEHICLES.filter((vehicle) => vehicle.image_url !== null)

export function inventorySummary(vehicles: Vehicle[]): string {
  const units = vehicles.reduce((total, vehicle) => total + vehicle.quantity, 0)
  return `${String(vehicles.length)} cars, ${String(units)} units in stock`
}
