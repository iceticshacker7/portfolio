import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth, type AdminUser } from '@/lib/auth'

interface AuthConfig {
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
    <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 px-4">
      <Card className="w-full max-w-[380px]">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>Only allow-listed accounts can manage the portfolio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!config && !error && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
          {config?.googleClientId && <div ref={googleButton} className="flex justify-center min-h-[44px]" />}
          {config?.passwordEnabled && (
            <form onSubmit={handlePassword} className="space-y-3">
              {config.googleClientId && <p className="text-center text-xs text-muted-foreground">or</p>}
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
          {config && !config.googleClientId && !config.passwordEnabled && (
            <p className="text-sm text-muted-foreground">
              No sign-in method is configured. Set <code>GOOGLE_CLIENT_ID</code> or <code>ADMIN_PASSWORD</code>, plus{' '}
              <code>ADMIN_EMAILS</code>, in the server environment.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
