import { Hero } from '../components/Hero'
import { VehicleCard } from '../components/VehicleCard'
import { SAMPLE_VEHICLES } from './styleSamples'
import './typeLab.css'

const PAIRINGS = [
  { id: 'a', name: 'A. Archivo Narrow 700 for the condensed bits, Archivo for everything else' },
  { id: 'b', name: 'B. Saira Condensed 700 for the condensed bits, Saira for everything else' },
]

const ONE_OF_EACH_STOCK_STATE = SAMPLE_VEHICLES.slice(0, 3)

export function TypePage() {
  return (
    <>
      {PAIRINGS.map((pairing) => (
        <section key={pairing.id} data-type={pairing.id} className="mb-16">
          <h2 className="mx-auto max-w-7xl px-4 py-6 text-xl font-bold sm:px-6">{pairing.name}</h2>
          <Hero count={SAMPLE_VEHICLES.length} tab="current" onTab={() => undefined} />
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
            {ONE_OF_EACH_STOCK_STATE.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPurchase={() => undefined}
                onDetails={() => undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
