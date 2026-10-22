import { useEffect } from 'react'

/**
 * Redraws the tab icon from the current profile photo as soon as it loads, so a new
 * upload shows up without waiting for a deploy. The build (scripts/favicons.ts) writes
 * the static favicon files that search engines and bookmarks use.
 */
export function useAvatarFavicon(avatar: string) {
  useEffect(() => {
    if (!avatar || !avatar.startsWith('/')) return
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      const size = 64
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      // Same framing as the build: a square around the upper-middle of the photo.
      const side = Math.min(img.width, img.height) * 0.62
      const sx = img.width / 2 - side / 2
      const sy = Math.min(img.height - side, Math.max(0, img.height * 0.4 - side / 2))
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
      const href = canvas.toDataURL('image/png')
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((link) => {
        link.href = href
        link.type = 'image/png'
      })
    }
    img.src = avatar
    return () => {
      cancelled = true
    }
  }, [avatar])
}
