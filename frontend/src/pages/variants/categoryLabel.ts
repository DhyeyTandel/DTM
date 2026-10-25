const ACRONYMS = new Set(['suv', 'ev'])

export function categoryLabel(category: string): string {
  if (ACRONYMS.has(category)) return category.toUpperCase()
  return category.charAt(0).toUpperCase() + category.slice(1)
}
