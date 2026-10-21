import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { firebaseConfigured, signInWithGoogleViaFirebase } from '@/lib/firebaseSignIn'
import { useAuth, type AdminUser } from '@/lib/auth'
import { useSeo } from '@/lib/seo'

interface AuthConfig {
  adminConfigured: boolean
  firebaseEnabled: boolean
  googleClientId: string | null
  passwordEnabled: boolean
}

interface GoogleIdApi {
  initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void }) => void
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } }
  }
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Google sign-in'))
    document.head.appendChild(script)
  })
}

export default function LoginPage() {
  useSeo({ title: 'Admin sign in', description: 'Admin sign in', path: '/login', noindex: true })
  const { user, loading, setUser } = useAuth()
  const location = useLocation()
  const [config, setConfig] = useState<AuthConfig | null>(null)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const googleButton = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get<AuthConfig>('/auth/config').then(setConfig).catch(() => setError('The API is not reachable. Check that the backend is running and MONGODB_URI is set.'))
  }, [])

  useEffect(() => {
    if (!config?.googleClientId || !googleButton.current || user) return
    const el = googleButton.current
    loadGoogleScript()
      .then(() => {
        window.google!.accounts.id.initialize({
          client_id: config.googleClientId!,
          callback: async ({ credential }) => {
            setError(null)
            try {
              const res = await api.post<{ user: AdminUser }>('/auth/google', { credential })
              setUser(res.user)
            } catch (e) {
              setError((e as Error).message)
            }
          },
        })
        window.google!.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 300, text: 'signin_with' })
      })
      .catch((e) => setError(e.message))
  }, [config, user, setUser])

  const handleFirebase = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const idToken = await signInWithGoogleViaFirebase()
      const res = await api.post<{ user: AdminUser }>('/auth/firebase', { idToken })
      setUser(res.user)
    } catch (e) {
      const code = (e as { code?: string }).code
      // Closing the popup isn't an error worth shouting about.
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(code === 'auth/unauthorized-domain' ? 'This domain is not authorized in Firebase Authentication settings.' : (e as Error).message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post<{ user: AdminUser }>('/auth/password', { password })
      setUser(res.user)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from?.startsWith('/admin') ? from : '/admin'} replace />
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-muted px-4">
      <Card className="w-full max-w-[380px]">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>Only allow-listed accounts can manage the portfolio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!config && !error && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
          {config && !config.adminConfigured && (
            <p className="text-sm rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/40 dark:border-yellow-800 p-3">
              No admin account is allow-listed yet. Set <code>ADMIN_EMAILS</code> in the server environment and redeploy.
            </p>
          )}
          {config?.firebaseEnabled && firebaseConfigured && (
            <Button className="w-full" variant="outline" type="button" onClick={handleFirebase} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
              )}
              Sign in with Google
            </Button>
          )}
          {config?.googleClientId && <div ref={googleButton} className="flex justify-center min-h-[44px]" />}
          {config?.passwordEnabled && (
            <form onSubmit={handlePassword} className="space-y-3">
              {(config.googleClientId || config.firebaseEnabled) && <p className="text-center text-xs text-muted-foreground">or</p>}
              <Input
                type="password"
                placeholder="Admin password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Sign in with password
              </Button>
            </form>
          )}
          {config && config.adminConfigured && !config.googleClientId && !config.passwordEnabled && !(config.firebaseEnabled && firebaseConfigured) && (
            <p className="text-sm text-muted-foreground">
              No sign-in method is configured. Set the Firebase web config (<code>VITE_APP_*</code>), <code>GOOGLE_CLIENT_ID</code> or{' '}
              <code>ADMIN_PASSWORD</code> in the server environment.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
