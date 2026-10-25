import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { StylePage } from './pages/StylePage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/style" element={<StylePage />} />
      </Route>
    </Routes>
  )
}
