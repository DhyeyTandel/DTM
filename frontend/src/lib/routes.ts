export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  newVehicle: '/admin/vehicles/new',
  vehicle: (vehicleId: number) => `/vehicles/${String(vehicleId)}`,
  editVehicle: (vehicleId: number) => `/admin/vehicles/${String(vehicleId)}/edit`,
}

export const ROUTE_PATTERNS = {
  vehicle: '/vehicles/:id',
  editVehicle: '/admin/vehicles/:id/edit',
}
