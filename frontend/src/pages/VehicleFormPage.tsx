import { useNavigate, useParams } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/PageState'
import { VehicleForm } from '../components/VehicleForm'
import { useCreateVehicle, useUpdateVehicle } from '../hooks/useVehicleAdmin'
import { useVehicle } from '../hooks/useVehicles'
import { EMPTY_VEHICLE_FORM, toVehicleFields, type VehicleFormValues } from '../lib/vehicleForm'
import type { Vehicle } from '../api/types'
import { PAISE_PER_RUPEE } from '../lib/money'
import { oneOf } from '../lib/oneOf'
import { ROUTES } from '../lib/routes'
import { CATEGORIES } from '../lib/categories'

function formValuesOf(vehicle: Vehicle): VehicleFormValues {
  return {
    make: vehicle.make,
    model: vehicle.model,
    category: oneOf(vehicle.category, CATEGORIES, CATEGORIES[0]),
    price: String(vehicle.price / PAISE_PER_RUPEE),
    quantity: String(vehicle.quantity),
    imageUrl: vehicle.image_url ?? '',
  }
}

function AddVehicle() {
  const create = useCreateVehicle()
  const navigate = useNavigate()

  return (
    <VehicleForm
      initialValues={EMPTY_VEHICLE_FORM}
      withQuantity
      pending={create.isPending}
      serverError={create.error?.message ?? null}
      onSubmit={(values) => {
        create.mutate(
          { ...toVehicleFields(values), quantity: Number(values.quantity) },
          {
            onSuccess: () => {
              void navigate(ROUTES.home)
            },
          },
        )
      }}
    />
  )
}

function EditVehicle({ vehicle }: { vehicle: Vehicle }) {
  const update = useUpdateVehicle(vehicle.id)
  const navigate = useNavigate()

  return (
    <VehicleForm
      initialValues={formValuesOf(vehicle)}
      withQuantity={false}
      pending={update.isPending}
      serverError={update.error?.message ?? null}
      onSubmit={(values) => {
        update.mutate(toVehicleFields(values), {
          onSuccess: () => {
            void navigate(ROUTES.vehicle(vehicle.id))
          },
        })
      }}
    />
  )
}

function EditVehicleLoader({ vehicleId }: { vehicleId: number }) {
  const { vehicle, isPending, isError, error, refetch } = useVehicle(vehicleId)

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
  if (!vehicle) {
    return <EmptyState title="We could not find that vehicle" text="It may have been removed." />
  }
  return <EditVehicle vehicle={vehicle} />
}

export function VehicleFormPage() {
  const { id } = useParams()
  const isEditing = id !== undefined

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold">{isEditing ? 'Edit vehicle' : 'Add vehicle'}</h1>
      {isEditing ? <EditVehicleLoader vehicleId={Number(id)} /> : <AddVehicle />}
    </div>
  )
}
