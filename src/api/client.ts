const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL
  return typeof url === 'string' && url.trim() !== '' ? url.trim().replace(/\/$/, '') : ''
}

export const hasBackend = (): boolean => getBaseUrl() !== ''

/** Backend error shape */
interface ApiErrorResponse {
  ok: false
  error: { message?: string }
}

/** Unwrap { ok, data } or { success, data } and throw on error */
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getBaseUrl()
  const url = base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : ''
  if (!url) {
    throw new Error('No API base URL configured')
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const contentType = res.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const body = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const msg = isJson && typeof body === 'object' && body && 'error' in body
      ? (body as ApiErrorResponse).error?.message
      : typeof body === 'string'
        ? body
        : `HTTP ${res.status}`
    throw new Error(msg || `HTTP ${res.status}`)
  }

  // Backend success: { ok: true, data } or { success: true, data }
  if (isJson && typeof body === 'object' && body !== null && 'data' in body) {
    return (body as { ok?: boolean; success?: boolean; data: T }).data as T
  }
  return body as T
}
