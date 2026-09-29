import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { checkIsAdmin, getCurrentUser, onAuthChange, signOut, type AuthUser } from '@/services/auth'

interface AuthValue {
  user: AuthUser | null
  isAdmin: boolean
  /** True until the initial session and admin check have resolved. */
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function resolve(u: AuthUser | null) {
      if (!u) {
        if (active) {
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
        }
        return
      }
      setLoading(true)
      let admin = false
      try {
        admin = await checkIsAdmin()
      } catch {
        admin = false
      }
      if (active) {
        setUser(u)
        setIsAdmin(admin)
        setLoading(false)
      }
    }

    getCurrentUser().then(resolve)
    const unsubscribe = onAuthChange((u) => {
      // Defer so Supabase's auth callback isn't blocked by our own queries
      window.setTimeout(() => resolve(u), 0)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, isAdmin, loading, logout: signOut }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
