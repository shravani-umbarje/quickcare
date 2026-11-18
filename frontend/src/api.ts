// API client. Base URL from VITE_API_BASE (default /api). No secrets here.
const BASE: string = (import.meta as any).env?.VITE_API_BASE ?? '/api'
export type User = { id: string; name: string; role: 'patient' | 'driver' | 'hospital' | 'lab' }
export class ApiError extends Error {
  constructor(public status: number, message: string, public fields: Record<string, string> = {}) { super(message) }
}
export const getUser = (): User | null => { try { return JSON.parse(sessionStorage.getItem('user') || 'null') } catch { return null } }
export const setSession = (token: string, user: User) => { sessionStorage.setItem('token', token); sessionStorage.setItem('user', JSON.stringify(user)) }
export const signOut = () => { sessionStorage.clear(); location.reload() }
export const phoneOk = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '').replace(/^\+91/, ''))

// Ujala's recommendation service (separate FastAPI app, CORS enabled). Optional X-API-Key = LIFELINE_API_KEY (dev only: it ships in the bundle).
const RBASE: string = (import.meta as any).env?.VITE_RECOMMENDER_URL ?? 'http://127.0.0.1:8000'
const RKEY: string | undefined = (import.meta as any).env?.VITE_RECOMMENDER_KEY
export const recommender = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { base: RBASE, method: body === undefined ? 'GET' : 'POST', body, headers: RKEY ? { 'X-API-Key': RKEY } : {}, auth: false })

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; base?: string; headers?: Record<string, string>; auth?: boolean } = {}): Promise<T> {
  const token = opts.auth === false ? null : sessionStorage.getItem('token')
  const isForm = opts.body instanceof FormData
  let res: Response
  try {
    res = await fetch((opts.base ?? BASE) + path, {
      method: opts.method ?? 'GET',
      headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers ?? {}) },
      body: opts.body === undefined ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
    })
  } catch { throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.') }
  if (res.status === 401 && opts.auth !== false) { signOut(); throw new ApiError(401, 'Your session expired. Please sign in again.') }
  let data: any = null
  try { data = await res.json() } catch { /* empty body */ }
  if (res.status === 403) throw new ApiError(403, 'You do not have access to this page.')
  if (!res.ok) throw new ApiError(res.status, data?.message || (typeof data?.detail === 'string' ? data.detail : data?.detail?.message) || `Request failed (${res.status}).`, data?.errors)
  return data as T
}
