import  { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth'
import { auth } from '../firebase' // Your Firebase config
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, LogOut, Loader2 } from 'lucide-react'

const googleProvider = new GoogleAuthProvider()

export default function LoginPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    try {
      setError(null)
      await signInWithPopup(auth, googleProvider)
      navigate('/login')
    } catch (error) {
      console.error("Error during login:", error)
      setError("Failed to log in. Please try again.")
    }
  }

  const handleLogout = async () => {
    try {
      setError(null)
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error("Error during logout:", error)
      setError("Failed to log out. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            {user ? `Logged in as ${user.displayName}` : 'Please sign in to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">You're currently logged in.</p>
             
              <Button className="w-full" onClick={() => navigate('/project-management')}>
                Go to Project Management
              </Button>
              <Button className="w-full" onClick={() => navigate('/certificate-management')}>
                Go to Certificate Management
              </Button>
              <Button className="w-full" onClick={() => navigate('/directory-management')}>
                Go to Learning Directory Management
              </Button>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}