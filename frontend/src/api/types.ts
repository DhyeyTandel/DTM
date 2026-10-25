import type { Category } from '../lib/categories'

export interface Vehicle {
  id: number
  make: string
  model: string
  category: Category
  price: number
  quantity: number
  image_url: string | null
}
