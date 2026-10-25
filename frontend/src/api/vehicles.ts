import { request } from './client'
import type { Vehicle } from './types'

export function listVehicles(): Promise<Vehicle[]> {
  return request<Vehicle[]>('/vehicles')
}

export function purchaseVehicle(vehicleId: number): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${String(vehicleId)}/purchase`, { method: 'POST' })
}

export interface NewVehicle {
  make: string
  model: string
  category: string
  price: number
  quantity: number
  image_url?: string
}

export interface VehicleChanges {
  make: string
  model: string
  category: string
  price: number
  image_url: string | null
}

export function createVehicle(vehicle: NewVehicle): Promise<Vehicle> {
  return request<Vehicle>('/vehicles', { method: 'POST', body: vehicle })
}

export function updateVehicle(vehicleId: number, changes: VehicleChanges): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${String(vehicleId)}`, { method: 'PUT', body: changes })
}

export function deleteVehicle(vehicleId: number): Promise<undefined> {
  return request<undefined>(`/vehicles/${String(vehicleId)}`, { method: 'DELETE' })
}

export function restockVehicle(vehicleId: number, amount: number): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${String(vehicleId)}/restock`, {
    method: 'POST',
    body: { amount },
  })
}
