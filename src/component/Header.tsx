import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ContactMeModal from "./ContactMeModal";
import { useProfile } from "@/lib/profile";
import { ThemeToggle } from "@/lib/theme";
import { navItems } from "@/lib/nav";


const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
  }`;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { profile } = useProfile();
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${profile.name}, home`}>
            <img src={profile.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/30" />
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              {profile.name || "Portfolio"}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {navItems.map((item) => (
              <NavLink key={item.href} to={item.href} className={linkClass}>
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Contact Me
            </button>
            <button
              type="button"
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-border bg-background">
          <nav className="max-w-6xl mx-auto px-4 py-3 grid gap-1" aria-label="Mobile">
            {navItems.map((item) => (
              <NavLink key={item.href} to={item.href} className={linkClass}>
                {item.name}
              </NavLink>
            ))}
            <button
              type="button"
              className="mt-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-teal-400"
              onClick={() => {
                setIsMenuOpen(false);
                setIsContactModalOpen(true);
              }}
            >
              Contact Me
            </button>
          </nav>
        </div>
      )}

      {/* Rendered once, outside the desktop-only block, so the mobile button can open it too. */}
      <ContactMeModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </header>
  );
}
