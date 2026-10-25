import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { StylePage } from './pages/StylePage'
import { VariantA } from './pages/variants/VariantA'
import { VariantB } from './pages/variants/VariantB'
import { VariantC } from './pages/variants/VariantC'

export function App() {
  return (
    <Routes>
      <Route path="/style/a" element={<VariantA />} />
      <Route path="/style/b" element={<VariantB />} />
      <Route path="/style/c" element={<VariantC />} />
      <Route element={<Layout />}>
        <Route path="/style" element={<StylePage />} />
      </Route>
    </Routes>
  )
}
