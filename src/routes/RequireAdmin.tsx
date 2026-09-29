import { Navigate, Outlet, useLocation } from 'react-router'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/** Guards every /admin route: requires a session AND a row in public.admins. */
export function RequireAdmin() {
  const { user, isAdmin, loading, logout } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper" role="status">
        <Loader2 className="size-6 animate-spin text-navy-700" aria-label="Checking your session" />
      </div>
    )
  }
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
  if (!isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper p-6">
        <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto size-8 text-red-600" aria-hidden />
          <h1 className="mt-4 font-display text-xl font-semibold">Access not granted</h1>
          <p className="mt-2 text-sm text-muted">
            You are signed in as {user.email}, but this account is not an administrator. Ask an existing admin to invite you.
          </p>
          <button onClick={() => logout()} className="mt-6 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700">
            Sign out
          </button>
        </div>
      </div>
    )
  }
  return <Outlet />
}
