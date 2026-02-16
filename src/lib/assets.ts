/**
 * Base URL for the app (e.g. '' or '/subpath'). Used so routing and asset
 * paths work on Render and with a custom domain, including any subpath deploy.
 */
export const BASE_URL = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '') || ''

/**
 * Resolve a public asset path (e.g. image) so it works with any base URL.
 * Use for files in public/, e.g. getImagePath('image/logo.png') → '/image/logo.png' or '/app/image/logo.png'.
 */
export function getImagePath(path: string): string {
  const normalized = path.replace(/^\//, '')
  return `${BASE_URL}/${normalized}`
}
