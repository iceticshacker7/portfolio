/**
 * The site mark: a "D" drawn as a neuron sending signals outward. Same artwork as
 * public/logo.svg (the favicon); keep the two in sync.
 */
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0 rounded-[22%] dark:ring-1 dark:ring-white/15`} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0f172a" />
      <g stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round">
        <path d="M29 32 42.7 19.3M29 32h19M29 32l13.7 12.7" />
      </g>
      <path d="M18 14v36h12a18 18 0 0 0 0-36Z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
      <g fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5">
        <circle cx="42.7" cy="19.3" r="4.2" />
        <circle cx="48" cy="32" r="4.2" />
        <circle cx="42.7" cy="44.7" r="4.2" />
      </g>
      <circle cx="29" cy="32" r="5" fill="#fff" />
    </svg>
  )
}
