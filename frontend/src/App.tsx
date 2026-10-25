import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { StylePage } from './pages/StylePage'
import { VariantD } from './pages/variants/VariantD'
import { VariantE } from './pages/variants/VariantE'
import { VariantF } from './pages/variants/VariantF'

export function App() {
  return (
    <Routes>
      <Route path="/style/d" element={<VariantD />} />
      <Route path="/style/e" element={<VariantE />} />
      <Route path="/style/f" element={<VariantF />} />
      <Route element={<Layout />}>
        <Route path="/style" element={<StylePage />} />
      </Route>
    </Routes>
  )
}
