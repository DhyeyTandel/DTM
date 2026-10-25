import { Hero } from '../components/Hero'
import { Listing } from '../components/Listing'
import { useListingParams } from '../hooks/useListingParams'
import { SAMPLE_VEHICLES } from './styleSamples'

export function StylePage() {
  const { params, update } = useListingParams()

  return (
    <>
      {/* The hero counts the whole lot, so it does not change with the tab or the filters. */}
      <Hero
        count={SAMPLE_VEHICLES.length}
        tab={params.tab}
        onTab={(tab) => {
          update({ tab })
        }}
      />
      <Listing
        vehicles={SAMPLE_VEHICLES}
        onPurchase={() => undefined}
        onDetails={() => undefined}
      />
    </>
  )
}
