import { Hero } from '../components/Hero'
import { Listing } from '../components/Listing'
import { useListingParams } from '../hooks/useListingParams'
import { SAMPLE_VEHICLES } from './styleSamples'

export function StylePage() {
  const { params, update } = useListingParams()

  return (
    <>
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
