export const CATEGORIES = ['sedan', 'suv', 'hatchback', 'coupe', 'truck', 'ev'] as const

export type Category = (typeof CATEGORIES)[number]
