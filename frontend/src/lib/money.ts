const PAISE_PER_RUPEE = 100

const wholeRupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const rupeesWithPaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

export function formatPrice(paise: number): string {
  const format = paise % PAISE_PER_RUPEE === 0 ? wholeRupees : rupeesWithPaise
  return format.format(paise / PAISE_PER_RUPEE)
}
