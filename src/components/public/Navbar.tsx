import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Logo } from '@/components/common/Logo'
import { LinkButton } from '@/components/common/Button'
import { SocialIcon, socialLabels } from '@/components/common/SocialIcon'
import { useDialogBehaviour } from '@/components/common/Modal'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/competitions', label: 'Competitions' },
  { to: '/champions', label: 'Champions' },
  { to: '/world-records', label: 'World Records' },
  { to: '/awards', label: 'Awards' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const { settings, social } = useSiteSettings()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const panel = useRef<HTMLDivElement>(null)
  useDialogBehaviour(open, () => setOpen(false), panel)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  const solid = scrolled
  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-[var(--banner-h,0px)] z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300',
          solid ? 'bg-white/95 shadow-[0_1px_0_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(11,31,51,0.18)] backdrop-blur-md' : 'bg-transparent',
        )}
      >
        <nav className="container-page flex h-18 items-center justify-between gap-6 lg:h-20" aria-label="Main">
          <Link to="/" className="shrink-0 rounded-lg" aria-label={`${settings?.org_name ?? 'Arjuna Book of World Record'} — home`}>
            <Logo logoUrl={settings?.logo_url} name={settings?.org_name} tone={solid ? 'dark' : 'light'} />
          </Link>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-full px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors',
                      solid ? 'text-ink/75 hover:text-navy-900' : 'text-white/75 hover:text-white',
                      isActive && (solid ? 'text-navy-900' : 'text-white'),
                      isActive && 'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-red-600',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <LinkButton to="/competitions" size="sm" iconRight={<ArrowRight className="size-3.5" aria-hidden />}>
                Explore competitions
              </LinkButton>
            </span>
            <button
              onClick={() => setOpen(true)}
              className={cn(
                'grid size-11 place-items-center rounded-full xl:hidden',
                solid ? 'text-navy-900 hover:bg-navy-50' : 'text-white hover:bg-white/10',
              )}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu className="size-6" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-navy-950 bg-grain text-white xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="container-page flex h-18 items-center justify-between">
              <Logo logoUrl={settings?.logo_url} name={settings?.org_name} tone="light" />
              <button onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close menu">
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <ul className="container-page mt-6 flex-1 space-y-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between border-b border-white/10 py-4 font-display text-2xl font-semibold tracking-tight',
                        isActive ? 'text-white' : 'text-white/60',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive && <span className="size-2 rounded-full bg-red-600" aria-hidden />}
                      </>
                    )}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
            <div className="container-page space-y-6 py-8">
              <LinkButton to="/competitions" className="w-full" iconRight={<ArrowRight className="size-4" aria-hidden />}>
                Explore competitions
              </LinkButton>
              {social.length > 0 && (
                <div className="flex justify-center gap-3">
                  {social.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid size-11 place-items-center rounded-full border border-white/15 hover:bg-white hover:text-navy-900"
                      aria-label={socialLabels[s.platform]}
                    >
                      <SocialIcon platform={s.platform} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
