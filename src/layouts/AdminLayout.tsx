import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { ExternalLink, Inbox, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, X } from 'lucide-react'
import { resources } from '@/admin/resources'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@/hooks/useQuery'
import { repo } from '@/services/repository'
import { isDemoMode } from '@/lib/env'
import { localDb } from '@/services/localDb'
import { cn } from '@/utils/cn'
import { Logo } from '@/components/common/Logo'
import { useDialogBehaviour } from '@/components/common/Modal'
import { NavigationProgress } from './PublicLayout'

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const newEnquiries = useQuery('admin:enquiries:new-count', () => repo('enquiries').count({ eq: { status: 'new' } }))
  const r = (key: string): NavItem => ({ to: `/admin/${key}`, label: resources[key].plural, icon: resources[key].icon })

  const groups: { title?: string; items: NavItem[] }[] = [
    { items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
    { title: 'Content', items: [r('competitions'), r('champions'), r('athletes'), r('world-records'), r('awards'), r('gallery'), r('news')] },
    { title: 'About page', items: [r('milestones'), r('officials')] },
    { title: 'Management', items: [r('certificates'), { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: newEnquiries.data }] },
    {
      title: 'System',
      items: [
        { to: '/admin/settings', label: 'Site Settings', icon: Settings },
        { to: '/admin/users', label: 'Admin Users', icon: ShieldCheck },
      ],
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Link to="/admin/dashboard" onClick={onNavigate} aria-label="Admin dashboard">
          <Logo showTagline={false} className="[&_img]:size-9" />
        </Link>
        <span className="ml-2 rounded bg-navy-50 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wider text-navy-700 uppercase">Admin</span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
        {groups.map((g, i) => (
          <div key={i}>
            {g.title && <p className="mb-1.5 px-3 text-[0.6875rem] font-semibold tracking-[0.12em] text-muted-light uppercase">{g.title}</p>}
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                        isActive ? 'bg-navy-900 text-white' : 'text-ink/75 hover:bg-paper hover:text-ink',
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {!!item.badge && <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[0.625rem] font-bold text-white">{item.badge}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <p className="truncate px-3 pb-2 text-xs text-muted" title={user?.email}>
          {user?.email}
        </p>
        <button
          onClick={async () => {
            await logout()
            navigate('/admin/login', { replace: true })
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/75 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="size-4" aria-hidden /> Logout
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const drawer = useRef<HTMLDivElement>(null)
  useDialogBehaviour(open, () => setOpen(false), drawer)
  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]') ?? Object.assign(document.createElement('meta'), { name: 'robots' })
    meta.setAttribute('content', 'noindex, nofollow')
    document.head.appendChild(meta)
    document.title = 'Admin | Khelratna'
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <NavigationProgress />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/40" onClick={() => setOpen(false)} />
          <div ref={drawer} role="dialog" aria-modal="true" aria-label="Admin navigation" className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute top-3.5 right-3 rounded-lg p-2 text-muted hover:bg-paper" aria-label="Close navigation">
              <X className="size-5" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink hover:bg-paper lg:hidden" aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          {isDemoMode && (
            <p className="hidden rounded-md bg-gold-50 px-2.5 py-1 text-xs text-gold-700 ring-1 ring-gold-500/30 sm:block">
              Demo mode · changes are saved in this browser only
            </p>
          )}
          <div className="ml-auto flex items-center gap-2">
            {isDemoMode && (
              <button
                onClick={() => {
                  if (window.confirm('Reset all demo content to the original placeholders?')) localDb.reset()
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:bg-paper hover:text-ink"
              >
                Reset demo data
              </button>
            )}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-navy-800 ring-1 ring-line hover:bg-paper"
            >
              View site <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
