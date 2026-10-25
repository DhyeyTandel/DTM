import { Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { RequireAdmin } from './components/RequireAdmin'
import { RequireAuth } from './components/RequireAuth'
import { InventoryPage } from './pages/InventoryPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VehicleDetailPage } from './pages/VehicleDetailPage'
import { VehicleFormPage } from './pages/VehicleFormPage'
import { ROUTE_PATTERNS, ROUTES } from './lib/routes'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path={ROUTES.home} element={<InventoryPage />} />
          <Route path={ROUTE_PATTERNS.vehicle} element={<VehicleDetailPage />} />
          <Route element={<RequireAdmin />}>
            <Route path={ROUTES.newVehicle} element={<VehicleFormPage />} />
            <Route path={ROUTE_PATTERNS.editVehicle} element={<VehicleFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Route>
    </Routes>
  )
}
