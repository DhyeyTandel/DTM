import type { Vehicle } from '../api/types'

const COMMONS = 'https://thumb.wikimedia.org/wikipedia/commons/thumb'

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 1,
    make: 'Honda',
    model: 'City',
    category: 'sedan',
    price: 14_49_000_00,
    quantity: 12,
    image_url: `${COMMONS}/5/5c/2022_Honda_City_ZX_i-VTEC_%28India%29_front_view.jpg/960px-2022_Honda_City_ZX_i-VTEC_%28India%29_front_view.jpg`,
  },
  {
    id: 2,
    make: 'Toyota',
    model: 'Fortuner',
    category: 'suv',
    price: 38_21_000_00,
    quantity: 2,
    image_url: `${COMMONS}/2/2c/Toyota_Fortuner_LTD_4x2_20221019.jpg/960px-Toyota_Fortuner_LTD_4x2_20221019.jpg`,
  },
  {
    id: 3,
    make: 'Maruti Suzuki',
    model: 'Swift',
    category: 'hatchback',
    price: 6_49_000_50,
    quantity: 0,
    image_url: `${COMMONS}/4/43/Maruti_Suzuki_Swift_4456.JPG/960px-Maruti_Suzuki_Swift_4456.JPG`,
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
