import { CATEGORIES, type Category } from './categories'
import { PAISE_PER_RUPEE } from './money'

// These limits mirror backend/app/limits.py. Change them together.
export const MAKE_MAX_LENGTH = 50
export const MODEL_MAX_LENGTH = 50
export const PRICE_MAX_PAISE = 10 ** 11
export const QUANTITY_MAX = 10000
export const IMAGE_URL_MAX_LENGTH = 500
export const RESTOCK_AMOUNT_MIN = 1
export const RESTOCK_AMOUNT_MAX = 1000

const IMAGE_URL_SCHEME = 'https://'
const IMAGE_PATH_PREFIX = '/images/'

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

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/
const WHOLE_NUMBER_PATTERN = /^\d+$/
const IMAGE_PATH_FORBIDDEN = ['..', '%', '\\']
const IMAGE_ADDRESS_HINT = 'Use an https address or a path that starts with /images/.'

function priceError(rupees: string): string | undefined {
  const trimmed = rupees.trim()
  if (!PRICE_PATTERN.test(trimmed) || Number(trimmed) <= 0) return 'Enter a price above zero.'
  return Math.round(Number(trimmed) * PAISE_PER_RUPEE) > PRICE_MAX_PAISE
    ? 'That price is too high.'
    : undefined
}

function quantityError(quantity: string): string | undefined {
  const trimmed = quantity.trim()
  if (trimmed === '') return 'Enter how many are in stock.'
  const valid = WHOLE_NUMBER_PATTERN.test(trimmed) && Number(trimmed) <= QUANTITY_MAX
  return valid ? undefined : `Quantity must be a whole number from 0 to ${String(QUANTITY_MAX)}.`
}

function imageUrlError(imageUrl: string): string | undefined {
  if (imageUrl === '') return undefined
  if (imageUrl.length > IMAGE_URL_MAX_LENGTH) {
    return `The address can be up to ${String(IMAGE_URL_MAX_LENGTH)} characters.`
  }
  if (/\s/.test(imageUrl)) return IMAGE_ADDRESS_HINT
  if (imageUrl.startsWith(IMAGE_URL_SCHEME)) {
    return imageUrl.length > IMAGE_URL_SCHEME.length ? undefined : IMAGE_ADDRESS_HINT
  }
  if (!imageUrl.startsWith(IMAGE_PATH_PREFIX) || imageUrl === IMAGE_PATH_PREFIX) {
    return IMAGE_ADDRESS_HINT
  }
  return IMAGE_PATH_FORBIDDEN.some((forbidden) => imageUrl.includes(forbidden))
    ? IMAGE_ADDRESS_HINT
    : undefined
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
  const trimmed = amount.trim()
  const valid =
    WHOLE_NUMBER_PATTERN.test(trimmed) &&
    Number(trimmed) >= RESTOCK_AMOUNT_MIN &&
    Number(trimmed) <= RESTOCK_AMOUNT_MAX
  return valid
    ? undefined
    : `Enter a whole number from ${String(RESTOCK_AMOUNT_MIN)} to ${String(RESTOCK_AMOUNT_MAX)}.`
}
