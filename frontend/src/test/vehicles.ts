import type { Vehicle } from '../api/types'

export function aVehicle(changes: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 1,
    make: 'Honda',
    model: 'City',
    category: 'sedan',
    price: 14_49_000_00,
    quantity: 5,
    image_url: null,
    ...changes,
  }
}
