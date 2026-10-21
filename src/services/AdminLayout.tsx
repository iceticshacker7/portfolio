import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

const sections = [
  { to: 'profile', label: 'Profile & About' },
  { to: 'projects', label: 'Projects' },
  { to: 'certificates', label: 'Certificates' },
  { to: 'learnings', label: 'Learnings' },
  { to: 'skills', label: 'Skills' },
  { to: 'experience', label: 'Experience' },
  { to: 'achievements', label: 'Achievements' },
  { to: 'contributions', label: 'Contributions' },
  { to: 'messages', label: 'Messages' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <aside className="md:w-56 shrink-0">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
          <p className="text-sm font-medium break-all">{user?.email}</p>
        </div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
          {sections.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-2 text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground/85 hover:bg-muted'}`
              }
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </aside>
      <section className="flex-grow min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
