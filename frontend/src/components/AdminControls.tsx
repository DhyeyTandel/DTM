import { Link } from 'react-router'
import type { Vehicle } from '../api/types'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { DeleteVehicle } from './DeleteVehicle'
import { RestockForm } from './RestockForm'

export function AdminControls({ vehicle }: { vehicle: Vehicle }) {
  const { data: user } = useCurrentUser()
  if (user?.role !== 'admin') return null

  return (
    <section aria-label="Admin controls" className="mt-10 grid gap-6 border-t border-line pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/admin/vehicles/${String(vehicle.id)}/edit`}
          className="flex min-h-11 items-center border border-ink px-4 text-[0.9375rem] font-semibold tracking-[0.04em] hover:bg-ink hover:text-canvas"
        >
          Edit
        </Link>
        <DeleteVehicle vehicle={vehicle} />
      </div>
      <RestockForm vehicle={vehicle} />
    </section>
  )
}
