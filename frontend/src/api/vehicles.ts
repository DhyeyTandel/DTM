import { request } from './client'
import type { Vehicle } from './types'

export function listVehicles(): Promise<Vehicle[]> {
  return request<Vehicle[]>('/vehicles')
}

export function purchaseVehicle(vehicleId: number): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${String(vehicleId)}/purchase`, { method: 'POST' })
}
