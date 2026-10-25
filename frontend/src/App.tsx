import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { StylePage } from './pages/StylePage'
import { TypePage } from './pages/TypePage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/style" element={<StylePage />} />
        <Route path="/style/type" element={<TypePage />} />
      </Route>
    </Routes>
  )
}
