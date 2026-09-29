import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router'
import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { DemoBanner } from '@/components/public/DemoBanner'

/** Thin progress bar while a lazily-loaded route chunk is fetched. */
export function NavigationProgress() {
  const navigation = useNavigation()
  if (navigation.state === 'idle') return null
  return <div className="fixed inset-x-0 top-0 z-[100] h-0.5 origin-left animate-pulse bg-red-600" role="progressbar" aria-label="Loading page" />
}

/** Scrolls to #hash targets once the page content (often async) has rendered. */
function HashScroller() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    const timers = [60, 400, 900].map((ms) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), ms))
    return () => timers.forEach(clearTimeout)
  }, [hash, pathname])
  return null
}

export default function PublicLayout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-md bg-white px-4 py-2 font-medium text-navy-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <NavigationProgress />
      <DemoBanner />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none" style={{ paddingTop: 'var(--banner-h, 0px)' }}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration getKey={(location) => location.pathname} />
      <HashScroller />
    </>
  )
}
