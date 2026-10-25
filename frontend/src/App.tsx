import { Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { RequireAdmin } from './components/RequireAdmin'
import { RequireAuth } from './components/RequireAuth'
import { InventoryPage } from './pages/InventoryPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VehicleDetailPage } from './pages/VehicleDetailPage'
import { VehicleFormPage } from './pages/VehicleFormPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin/vehicles/new" element={<VehicleFormPage />} />
            <Route path="/admin/vehicles/:id/edit" element={<VehicleFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
