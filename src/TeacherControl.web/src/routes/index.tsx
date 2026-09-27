import { Route, Routes } from 'react-router'
import { VzorPage } from '@/features/vzor'
import { FeatureTodo } from './FeatureTodo'

/**
 * Jediné místo, kde se přidávají stránky featur.
 * Až budeš mít stránku hotovou, nahraď u své featury `element` za svoji komponentu.
 */
export const APP_ROUTES = [
  { path: '/vzor', label: 'Vzor', element: <VzorPage /> },
  { path: '/bingo', label: 'F1 Bingo', element: <FeatureTodo code="F1" name="Bingo" /> },
  { path: '/rating', label: 'F2 Rating', element: <FeatureTodo code="F2" name="Rating" /> },
  { path: '/recenze', label: 'F3 Recenze', element: <FeatureTodo code="F3" name="Recenze" /> },
  { path: '/abstence', label: 'F4 Abstence', element: <FeatureTodo code="F4" name="Abstence" /> },
  { path: '/pololeti', label: 'F5 Pololetí', element: <FeatureTodo code="F5" name="Pololetí" /> },
  { path: '/login', label: 'F6 Login', element: <FeatureTodo code="F6" name="Login" /> },
]

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<VzorPage />} />
      {APP_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  )
}
