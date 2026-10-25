import { Link, useParams } from 'react-router'
import { Button } from '../components/Button'
import { NoticeText } from '../components/NoticeText'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { PriceAndStatus } from '../components/PriceAndStatus'
import { VehiclePhoto } from '../components/VehiclePhoto'
import { usePurchase } from '../hooks/usePurchase'
import { useVehicles } from '../hooks/useVehicles'
import { categoryLabel } from '../lib/categories'
import { OUT_OF_STOCK_LABEL, isSoldOut } from '../lib/stock'
import { formatStockNumber } from '../lib/stockNumber'

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
    >
      ← Back to the lot
    </Link>
  )
}

export function VehicleDetailPage() {
  const vehicleId = Number(useParams().id)
  const { data: vehicles, isPending, isError, error, refetch } = useVehicles()
  const { purchase, pendingIds, notices } = usePurchase()

  if (isPending) return <LoadingState label="Loading the vehicle" />
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
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId)
  if (!vehicle) {
    return (
      <>
        <EmptyState
          title="We could not find that vehicle"
          text="It may have been removed from the lot."
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <BackLink />
        </div>
      </>
    )
  }

  const name = `${vehicle.make} ${vehicle.model}`
  const notice = notices.get(vehicle.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BackLink />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <VehiclePhoto imageUrl={vehicle.image_url} description={name} quantity={vehicle.quantity} />
        <div className="flex flex-col">
          <h1 className="text-4xl leading-tight font-semibold">{name}</h1>
          <p className="mt-2 text-[1.0625rem]">
            <span>{categoryLabel(vehicle.category)}</span> ·{' '}
            <span>{formatStockNumber(vehicle.id)}</span>
          </p>
          <div className="mt-8 border-t border-line pt-6">
            <PriceAndStatus vehicle={vehicle} large />
          </div>
          {notice && <NoticeText notice={notice} />}
          <Button
            className="mt-6 self-start"
            disabled={isSoldOut(vehicle.quantity) || pendingIds.has(vehicle.id)}
            onClick={() => {
              purchase(vehicle.id)
            }}
          >
            {isSoldOut(vehicle.quantity) ? OUT_OF_STOCK_LABEL : 'Purchase'}
          </Button>
        </div>
      </div>
    </div>
  )
}
