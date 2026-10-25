import type { Tab } from '../lib/listing'
import { STATUS_NAMES } from '../lib/stock'

const HERO_PHOTO = '/images/toyota-fortuner.jpg'
const HERO_SCRIM = 'linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.82))'

const TABS: { value: Tab; label: string }[] = [
  { value: 'current', label: 'Current' },
  { value: 'sold-out', label: STATUS_NAMES['sold-out'] },
]

interface HeroProps {
  count: number
  tab: Tab
  onTab: (tab: Tab) => void
}

export function Hero({ count, tab, onTab }: HeroProps) {
  return (
    <section
      className="bg-band bg-cover bg-center text-on-band"
      style={{
        backgroundImage: `${HERO_SCRIM}, url(${HERO_PHOTO})`,
      }}
    >
      <div className="mx-auto flex min-h-72 max-w-7xl flex-col justify-end px-4 sm:min-h-96 sm:px-6">
        <h1 className="font-display pt-20 pb-8 text-[clamp(3rem,9vw,7rem)] leading-[0.9] font-bold uppercase">
          {count} {count === 1 ? 'car' : 'cars'} on the lot
        </h1>
        <nav aria-label="Inventory view" className="flex gap-1">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => {
                onTab(value)
              }}
              className={`min-h-12 cursor-pointer px-6 text-[0.9375rem] font-semibold transition-colors ${
                tab === value
                  ? 'bg-brand text-on-brand'
                  : 'bg-white/10 text-on-band hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  )
}
