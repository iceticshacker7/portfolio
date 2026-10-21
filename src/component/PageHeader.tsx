import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Title block shared by every top-level page, so headings, spacing and alignment match. */
export default function PageHeader({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <motion.header
      className="max-w-3xl mx-auto text-center mb-10"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">{eyebrow}</p>}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">{subtitle}</p>}
      {children}
    </motion.header>
  );
}

/** Standard page shell: consistent width, gutters and vertical rhythm. */
export function PageShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`${wide ? "max-w-7xl" : "max-w-6xl"} mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16`}>{children}</div>;
}

/** Pill filter row used on the projects and certificates pages. */
export function FilterPills({ options, active, onChange, format = (s: string) => s, size = "md" }: {
  options: string[];
  active: string | null;
  onChange: (v: string) => void;
  format?: (s: string) => string;
  size?: "md" | "sm";
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={active === o}
          onClick={() => onChange(o)}
          className={`rounded-full border transition-colors ${size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"} font-medium ${
            active === o
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
          }`}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}
