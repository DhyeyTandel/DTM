import { CATEGORIES, categoryLabel, type Category } from '../lib/categories'

interface CategoryTilesProps {
  selected: Category | ''
  onSelect: (category: Category | '') => void
}

export function CategoryTiles({ selected, onSelect }: CategoryTilesProps) {
  return (
    <section aria-labelledby="browse-by-category">
      <h2 id="browse-by-category" className="font-display text-2xl font-bold uppercase">
        Browse by category
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
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
              className={`size-24 cursor-pointer border text-sm font-semibold tracking-widest uppercase transition-colors sm:size-32 sm:text-base ${
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
