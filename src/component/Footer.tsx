import { Link } from 'react-router-dom'
import { useProfile } from '@/lib/profile'
import { socialIconMap } from '@/lib/icons'
import { navItems } from '@/lib/nav'
import Logo from './Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { profile } = useProfile()

  return (
    <footer className="w-full border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <Logo className="h-10 w-10" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                {profile.name}
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">{profile.footerTagline}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Explore</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Connect</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {profile.socials.map(({ platform, url: href }) => {
                const { Icon, label } = socialIconMap[platform]
                return (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>&copy; {currentYear} {profile.name}. All rights reserved.</p>
          {/* No admin link on the public site: sign in at /login directly. */}
        </div>
      </div>
    </footer>
  )
}
