import { request } from './client'
import type { Vehicle } from './types'

export function listVehicles(): Promise<Vehicle[]> {
  return request<Vehicle[]>('/vehicles')
}
