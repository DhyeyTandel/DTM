export const CATEGORIES = ['sedan', 'suv', 'hatchback', 'coupe', 'truck', 'ev'] as const

export type Category = (typeof CATEGORIES)[number]

const ACRONYM_CATEGORIES: readonly string[] = ['suv', 'ev']

export function categoryLabel(category: string): string {
  if (ACRONYM_CATEGORIES.includes(category)) return category.toUpperCase()
  return category.charAt(0).toUpperCase() + category.slice(1)
}
