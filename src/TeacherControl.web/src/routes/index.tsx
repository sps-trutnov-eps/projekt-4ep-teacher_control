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
  { path: '/recenze', label: 'F3 Recenze', element: <FeatureTodo code="F3" name="Recenze" /> },
  { path: '/abstence', label: 'F4 Abstence', element: <FeatureTodo code="F4" name="Abstence" /> },
  { path: '/pololeti', label: 'F5 Pololetí', element: <FeatureTodo code="F5" name="Pololetí" /> },
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
