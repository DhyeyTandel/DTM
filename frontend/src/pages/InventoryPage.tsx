import { useNavigate } from 'react-router'
import { Hero } from '../components/Hero'
import { Listing } from '../components/Listing'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { useListingParams } from '../hooks/useListingParams'
import { useVehicles } from '../hooks/useVehicles'

export function InventoryPage() {
  const { data: vehicles, isPending, isError, error, refetch } = useVehicles()
  const { params, update } = useListingParams()
  const navigate = useNavigate()

  if (isPending) return <LoadingState label="Loading the lot" />
  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }
  if (vehicles.length === 0) {
    return (
      <EmptyState
        title="Nothing on the lot yet"
        text="New cars will show up here as soon as they arrive."
      />
    )
  }

  return (
    <>
      <Hero
        count={vehicles.length}
        tab={params.tab}
        onTab={(tab) => {
          update({ tab })
        }}
      />
      <Listing
        vehicles={vehicles}
        onPurchase={() => undefined}
        onDetails={(vehicleId) => {
          void navigate(`/vehicles/${String(vehicleId)}`)
        }}
      />
    </>
  )
}
