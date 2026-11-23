import { Navigate, Route, Routes } from 'react-router'
import { RequireAuth } from '@/shared/auth'
import { BingoPage } from '@/features/bingo'
import { VzorPage } from '@/features/vzor'
import { AbstencePage } from '@/features/abstence'
import { PololetiPage } from '@/features/pololeti'
import { RatingPage } from '@/features/rating'
import { LoginPage, RegisterPage } from '@/features/auth'
import { UserPage } from '@/features/user'
import { RecenzePage } from '@/features/recenze'
import { HomePage } from '@/features/home'
import { TeacherProfilePage } from '@/features/ucitel'
import { TEACHER_SECTIONS } from './teacherSections'

/** Jediné stránky, které vidí nepřihlášený uživatel. */
export const PUBLIC_ROUTES = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]

/**
 * Jediné místo, kde se přidávají stránky featur. Všechny jsou jen pro přihlášené.
 * Stránka s `label` je v navigaci.
 */
export const APP_ROUTES = [
  { path: '/', label: 'Domů', element: <HomePage /> },
  { path: '/bingo', label: 'Bingo', element: <BingoPage /> },
  { path: '/rating', label: 'Hodnocení', element: <RatingPage /> },
  { path: '/recenze', label: 'Recenze', element: <RecenzePage /> },
  { path: '/abstence', label: 'Abstence', element: <AbstencePage /> },
  { path: '/pololeti', label: 'Pololetní hlasování', element: <PololetiPage /> },
  { path: '/ucitel/:id', element: <TeacherProfilePage sections={TEACHER_SECTIONS} /> },
  { path: '/user', label: 'Můj profil', element: <UserPage /> },
  { path: '/profile', element: <UserPage /> },
  // Referenční featura běží jen na mockách, na nasazené aplikaci by neměla co ukázat.
  ...(import.meta.env.DEV ? [{ path: '/vzor', element: <VzorPage /> }] : []),
]

export function AppRoutes() {
  return (
    <Routes>
      {PUBLIC_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {APP_ROUTES.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<RequireAuth>{route.element}</RequireAuth>}
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
