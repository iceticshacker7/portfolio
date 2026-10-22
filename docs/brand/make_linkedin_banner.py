"""Builds docs/brand/linkedin-banner.svg (1584x396, LinkedIn's banner size).

Render to PNG with:  node -e "require('sharp')('docs/brand/linkedin-banner.svg',{density:144}).png().toFile('docs/brand/linkedin-banner.png')"
"""
import random
from pathlib import Path

W, H = 1584, 396
rng = random.Random(7)

# A loose neural net drifting left -> right, fading in toward the text block.
cols = [(150, 5), (300, 7), (450, 8), (600, 7), (740, 5), (860, 3)]
layers = []
for i, (x, n) in enumerate(cols):
    ys = sorted(rng.uniform(40, H - 40) for _ in range(n))
    layers.append([(x + rng.uniform(-18, 18), y) for y in ys])

edges, nodes = [], []
for i in range(len(layers) - 1):
    for a in layers[i]:
        for b in layers[i + 1]:
            if rng.random() < 0.38:
                fade = 0.10 + 0.25 * (i / (len(layers) - 2))
                hot = rng.random() < 0.10
                edges.append(
                    f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" '
                    f'stroke="{"#60a5fa" if hot else "#3b82f6"}" stroke-width="{1.6 if hot else 1}" opacity="{0.7 if hot else fade:.2f}"/>'
                )
for i, layer in enumerate(layers):
    for x, y in layer:
        lit = rng.random() < 0.22
        r = 4.5 if lit else 3
        op = 0.35 + 0.5 * (i / (len(layers) - 1))
        if lit:
            nodes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="11" fill="url(#halo)"/>')
        nodes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{"#93c5fd" if lit else "#1e40af"}" opacity="{1 if lit else op:.2f}"/>')

LOGO = (
    '<rect width="64" height="64" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>'
    '<g stroke="#60a5fa" stroke-width="2.2" stroke-linecap="round"><path d="M29 32 42.7 19.3M29 32h19M29 32l13.7 12.7"/></g>'
    '<path d="M18 14v36h12a18 18 0 0 0 0-36Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>'
    '<g fill="#3b82f6" stroke="#0f172a" stroke-width="1.5"><circle cx="42.7" cy="19.3" r="4.2"/><circle cx="48" cy="32" r="4.2"/><circle cx="42.7" cy="44.7" r="4.2"/></g>'
    '<circle cx="29" cy="32" r="5" fill="#fff"/>'
)

TX = 950  # left edge of the text block (clear of the profile photo on desktop and mobile)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#070d1a"/><stop offset="1" stop-color="#0f1b33"/></linearGradient>
  <radialGradient id="glow" cx="0.72" cy="0.35" r="0.55"><stop offset="0" stop-color="#2563eb" stop-opacity="0.28"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></radialGradient>
  <radialGradient id="halo"><stop offset="0" stop-color="#60a5fa" stop-opacity="0.55"/><stop offset="1" stop-color="#60a5fa" stop-opacity="0"/></radialGradient>
  <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#94a3b8" opacity="0.10"/></pattern>
  <linearGradient id="fadeR" x1="0" x2="1"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="0.68" stop-color="#0b1427" stop-opacity="0.85"/></linearGradient>
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<rect width="{W}" height="{H}" fill="url(#dots)"/>
<rect width="{W}" height="{H}" fill="url(#glow)"/>
<g>{"".join(edges)}{"".join(nodes)}</g>
<rect width="{W}" height="{H}" fill="url(#fadeR)"/>
<rect x="0" y="0" width="{W}" height="4" fill="#2563eb"/>

<g transform="translate({TX} 70) scale(1.05)">{LOGO}</g>
<text x="{TX + 86}" y="96" font-family="Inter" font-weight="600" font-size="19" letter-spacing="3" fill="#93c5fd">AI ENGINEER · TCS</text>
<text x="{TX + 86}" y="124" font-family="Inter" font-weight="500" font-size="17" fill="#94a3b8">AI/ML Research &amp; Development</text>

<text x="{TX}" y="210" font-family="Inter" font-weight="800" font-size="42" letter-spacing="-1" fill="#f8fafc">Building practical</text>
<text x="{TX}" y="262" font-family="Inter" font-weight="800" font-size="42" letter-spacing="-1" fill="#f8fafc">machine learning <tspan fill="#60a5fa">products.</tspan></text>

<text x="{TX}" y="312" font-family="Inter" font-weight="500" font-size="18" fill="#cbd5e1">Machine Learning  ·  Computer Vision  ·  LLM Applications</text>
<g transform="translate({TX} 336)">
  <rect width="172" height="34" rx="17" fill="#0f172a" stroke="#334155"/>
  <circle cx="18" cy="17" r="4" fill="#3b82f6"/>
  <text x="32" y="23" font-family="Inter" font-weight="600" font-size="16" fill="#e2e8f0">divyanshrai.in</text>
</g>
</svg>
'''
Path(__file__).with_name("linkedin-banner.svg").write_text(svg)
print("wrote linkedin-banner.svg")
