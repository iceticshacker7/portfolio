# Brand assets

- **Logo / favicon:** `public/logo.svg` (a "D" drawn as a neuron), mirrored in `src/component/Logo.tsx`. `npm run icons` regenerates the favicon set.
- **Colours:** navy `#0f172a` / `#0b1220`, blue `#2563eb` / `#3b82f6`, light blue `#60a5fa` / `#93c5fd`, text `#f8fafc` / `#cbd5e1`. Font: Inter.
- **LinkedIn banner:** `linkedin-banner-1584x396.png` (upload this one) and `linkedin-banner.png` (2× for sharpness). Text sits on the right because LinkedIn's profile photo covers the bottom-left. To change the wording, edit `make_linkedin_banner.py`, run `python3 docs/brand/make_linkedin_banner.py`, then render the PNGs with the command in its docstring (twice: `density: 72` for 1584×396, `144` for 2×).
