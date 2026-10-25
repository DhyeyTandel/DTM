import type { Vehicle } from '../api/types'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { ButtonLink } from './Button'
import { DeleteVehicle } from './DeleteVehicle'
import { RestockForm } from './RestockForm'

export function AdminControls({ vehicle }: { vehicle: Vehicle }) {
  const { data: user } = useCurrentUser()
  if (user?.role !== 'admin') return null

  return (
    <section aria-label="Admin controls" className="mt-10 grid gap-6 border-t border-line pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink variant="outline" to={`/admin/vehicles/${String(vehicle.id)}/edit`}>
          Edit
        </ButtonLink>
        <DeleteVehicle vehicle={vehicle} />
      </div>
      <RestockForm vehicle={vehicle} />
    </section>
  )
}
