import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { MotionConfig } from 'framer-motion'
import './index.css'
import { router } from './routes'
import { AuthProvider } from './hooks/useAuth'
import { SiteSettingsProvider } from './hooks/useSiteSettings'
import { ToastProvider } from './components/common/Toast'
import { FaviconSync } from './components/common/FaviconSync'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <SiteSettingsProvider>
        <AuthProvider>
          <ToastProvider>
            <FaviconSync />
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </SiteSettingsProvider>
    </MotionConfig>
  </StrictMode>,
)
