const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

let _refreshing = null

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('biasmap_refresh_token')
  if (!refreshToken) throw new Error('No refresh token')
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) throw new Error('Refresh failed')
  const data = await res.json()
  localStorage.setItem('biasmap_token',         data.accessToken)
  localStorage.setItem('biasmap_refresh_token', data.refreshToken)
  localStorage.setItem('biasmap_user',          JSON.stringify(data.user))
  return data.accessToken
}

async function request(method, path, body, retry = true) {
  const token = localStorage.getItem('biasmap_token')
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Access token expired — attempt one silent refresh
  if (res.status === 401 && retry) {
    try {
      if (!_refreshing) _refreshing = refreshAccessToken().finally(() => { _refreshing = null })
      await _refreshing
      return request(method, path, body, false)
    } catch {
      localStorage.removeItem('biasmap_token')
      localStorage.removeItem('biasmap_refresh_token')
      localStorage.removeItem('biasmap_user')
      window.location.reload()
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `Request failed (${res.status})`
    const e = new Error(msg)
    e.status = res.status
    throw e
  }
  return res.json()
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  delete: (path)        => request('DELETE', path),
}
