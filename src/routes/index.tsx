import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import PublicLayout from '@/layouts/PublicLayout'
import RouteError from '@/pages/public/RouteError'
import { RequireAdmin } from './RequireAdmin'

// Every page is its own chunk; the public layout ships in the main bundle.
type PageModule = { default: React.ComponentType }
const page = (load: () => Promise<PageModule>) => async () => ({ Component: (await load()).default })

const publicRoutes: RouteObject[] = [
  { index: true, lazy: page(() => import('@/pages/public/HomePage')) },
  { path: 'about', lazy: page(() => import('@/pages/public/AboutPage')) },
  { path: 'competitions', lazy: page(() => import('@/pages/public/CompetitionsPage')) },
  { path: 'competitions/:slug', lazy: page(() => import('@/pages/public/CompetitionDetailPage')) },
  { path: 'champions', lazy: page(() => import('@/pages/public/ChampionsPage')) },
  { path: 'athletes/:slug', lazy: page(() => import('@/pages/public/AthletePage')) },
  { path: 'world-records', lazy: page(() => import('@/pages/public/WorldRecordsPage')) },
  { path: 'world-records/:slug', lazy: page(() => import('@/pages/public/WorldRecordDetailPage')) },
  { path: 'awards', lazy: page(() => import('@/pages/public/AwardsPage')) },
  { path: 'gallery', lazy: page(() => import('@/pages/public/GalleryPage')) },
  { path: 'news', lazy: page(() => import('@/pages/public/NewsPage')) },
  { path: 'news/:slug', lazy: page(() => import('@/pages/public/NewsDetailPage')) },
  { path: 'certificates', lazy: page(() => import('@/pages/public/CertificatesPage')) },
  { path: 'contact', lazy: page(() => import('@/pages/public/ContactPage')) },
  { path: 'privacy', lazy: page(() => import('@/pages/public/PrivacyPage')) },
  { path: 'terms', lazy: page(() => import('@/pages/public/TermsPage')) },
  { path: '*', lazy: page(() => import('@/pages/public/NotFoundPage')) },
]

const adminRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="/admin/dashboard" replace /> },
  { path: 'dashboard', lazy: page(() => import('@/pages/admin/DashboardPage')) },
  { path: 'enquiries', lazy: page(() => import('@/pages/admin/EnquiriesPage')) },
  { path: 'settings', lazy: page(() => import('@/pages/admin/SettingsPage')) },
  { path: 'users', lazy: page(() => import('@/pages/admin/AdminUsersPage')) },
  { path: ':resource', lazy: page(() => import('@/pages/admin/ResourceListPage')) },
  { path: ':resource/new', lazy: page(() => import('@/pages/admin/ResourceEditPage')) },
  { path: ':resource/:id', lazy: page(() => import('@/pages/admin/ResourceEditPage')) },
]

export const router = createBrowserRouter([
  { path: '/', element: <PublicLayout />, errorElement: <RouteError />, children: publicRoutes },
  { path: '/admin/login', lazy: page(() => import('@/pages/admin/LoginPage')), errorElement: <RouteError /> },
  {
    path: '/admin',
    element: <RequireAdmin />,
    errorElement: <RouteError />,
    children: [{ lazy: async () => ({ Component: (await import('@/layouts/AdminLayout')).default }), children: adminRoutes }],
  },
])
