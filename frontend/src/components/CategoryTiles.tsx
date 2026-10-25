import { CATEGORIES, categoryLabel } from '../lib/categories'

interface CategoryTilesProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryTiles({ selected, onSelect }: CategoryTilesProps) {
  return (
    <section aria-labelledby="browse-by-category">
      <h2 id="browse-by-category" className="font-display text-2xl font-bold uppercase">
        Browse by category
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {CATEGORIES.map((category) => {
          const isSelected = category === selected
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                onSelect(isSelected ? '' : category)
              }}
              className={`aspect-square cursor-pointer border text-sm font-semibold tracking-widest uppercase transition-colors sm:text-base ${
                isSelected
                  ? 'border-brand bg-brand text-on-brand'
                  : 'border-line bg-surface text-ink hover:border-ink'
              }`}
            >
              {categoryLabel(category)}
            </button>
          )
        })}
      </div>
    </section>
  )
}
