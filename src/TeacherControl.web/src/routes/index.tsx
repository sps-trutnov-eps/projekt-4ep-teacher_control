import { Route, Routes } from 'react-router'
import { RatingPage } from '@/features/rating'
import { FeatureTodo } from './FeatureTodo'

/**
 * Jediné místo, kde se přidávají stránky featur.
 * Až budeš mít stránku hotovou, nahraď u své featury `element` za svoji komponentu.
 */
export const APP_ROUTES = [
  { path: '/rating', label: 'F2 Rating', element: <RatingPage /> },
  { path: '/bingo', label: 'F1 Bingo', element: <FeatureTodo code="F1" name="Bingo" /> },
  { path: '/hodnoceni', label: 'F3 Hodnocení', element: <FeatureTodo code="F3" name="Hodnocení" /> },
  { path: '/absence', label: 'F4 Absence', element: <FeatureTodo code="F4" name="Absence" /> },
  { path: '/hlasovani', label: 'F5 Hlasování', element: <FeatureTodo code="F5" name="Hlasování" /> },
  { path: '/login', label: 'F6 Login', element: <FeatureTodo code="F6" name="Login" /> },
]

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RatingPage />} />
      {APP_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  )
}
