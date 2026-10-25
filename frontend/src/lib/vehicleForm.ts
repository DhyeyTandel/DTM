import { CATEGORIES, type Category } from './categories'
import { PAISE_PER_RUPEE } from './money'

export const MAKE_MAX_LENGTH = 50
export const MODEL_MAX_LENGTH = 50
export const PRICE_MAX_PAISE = 10 ** 11
export const QUANTITY_MAX = 10000
export const IMAGE_URL_MAX_LENGTH = 500
export const RESTOCK_AMOUNT_MIN = 1
export const RESTOCK_AMOUNT_MAX = 1000

const IMAGE_URL_SCHEME = 'https://'
const IMAGE_PATH_PREFIX = '/images/'
const IMAGE_PATH_FORBIDDEN = '..'

export interface VehicleFormValues {
  make: string
  model: string
  category: Category
  price: string
  quantity: string
  imageUrl: string
}

export type VehicleFormErrors = Partial<Record<keyof VehicleFormValues, string>>

export interface VehicleFields {
  make: string
  model: string
  category: Category
  price: number
  image_url: string | null
}

export const EMPTY_VEHICLE_FORM: VehicleFormValues = {
  make: '',
  model: '',
  category: CATEGORIES[0],
  price: '',
  quantity: '',
  imageUrl: '',
}

function textError(value: string, name: string, maxLength: number): string | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return `Enter the ${name}.`
  return trimmed.length > maxLength
    ? `The ${name} can be up to ${String(maxLength)} characters.`
    : undefined
}

function priceError(rupees: string): string | undefined {
  const amount = Number(rupees)
  if (rupees.trim() === '' || Number.isNaN(amount) || amount <= 0)
    return 'Enter a price above zero.'
  return Math.round(amount * PAISE_PER_RUPEE) > PRICE_MAX_PAISE
    ? 'That price is too high.'
    : undefined
}

function quantityError(quantity: string): string | undefined {
  if (quantity.trim() === '') return 'Enter how many are in stock.'
  const amount = Number(quantity)
  const valid = Number.isInteger(amount) && amount >= 0 && amount <= QUANTITY_MAX
  return valid ? undefined : `Quantity must be a whole number from 0 to ${String(QUANTITY_MAX)}.`
}

function imageUrlError(imageUrl: string): string | undefined {
  if (imageUrl === '') return undefined
  if (imageUrl.length > IMAGE_URL_MAX_LENGTH) {
    return `The address can be up to ${String(IMAGE_URL_MAX_LENGTH)} characters.`
  }
  const allowedStart =
    imageUrl.startsWith(IMAGE_URL_SCHEME) || imageUrl.startsWith(IMAGE_PATH_PREFIX)
  const isPathWithDots =
    imageUrl.startsWith(IMAGE_PATH_PREFIX) && imageUrl.includes(IMAGE_PATH_FORBIDDEN)
  const hasSpace = /\s/.test(imageUrl)
  const hasNothingAfterStart = imageUrl === IMAGE_URL_SCHEME || imageUrl === IMAGE_PATH_PREFIX
  return allowedStart && !isPathWithDots && !hasSpace && !hasNothingAfterStart
    ? undefined
    : 'Use an https address or a path that starts with /images/.'
}

export function checkVehicleForm(
  values: VehicleFormValues,
  withQuantity: boolean,
): VehicleFormErrors {
  const checks: [keyof VehicleFormValues, string | undefined][] = [
    ['make', textError(values.make, 'make', MAKE_MAX_LENGTH)],
    ['model', textError(values.model, 'model', MODEL_MAX_LENGTH)],
    ['price', priceError(values.price)],
    ['quantity', withQuantity ? quantityError(values.quantity) : undefined],
    ['imageUrl', imageUrlError(values.imageUrl.trim())],
  ]
  return Object.fromEntries(
    checks.filter((check): check is [keyof VehicleFormValues, string] => check[1] !== undefined),
  )
}

export function toVehicleFields(values: VehicleFormValues): VehicleFields {
  const imageUrl = values.imageUrl.trim()
  return {
    make: values.make.trim(),
    model: values.model.trim(),
    category: values.category,
    price: Math.round(Number(values.price) * PAISE_PER_RUPEE),
    image_url: imageUrl === '' ? null : imageUrl,
  }
}

export function restockError(amount: string): string | undefined {
  const value = Number(amount)
  const valid =
    amount.trim() !== '' &&
    Number.isInteger(value) &&
    value >= RESTOCK_AMOUNT_MIN &&
    value <= RESTOCK_AMOUNT_MAX
  return valid
    ? undefined
    : `Enter a whole number from ${String(RESTOCK_AMOUNT_MIN)} to ${String(RESTOCK_AMOUNT_MAX)}.`
}
