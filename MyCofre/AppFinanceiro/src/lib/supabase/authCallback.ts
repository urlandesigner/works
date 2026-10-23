import type { SupabaseClient } from '@supabase/supabase-js'

export type AuthLinkType = 'recovery' | 'invite' | 'signup' | 'magiclink' | null

function readUrlAuthParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()

  const hash = window.location.hash.replace(/^#/, '')
  const hashParams = new URLSearchParams(hash)
  const searchParams = new URLSearchParams(window.location.search)

  const merged = new URLSearchParams(searchParams)
  hashParams.forEach((value, key) => {
    if (!merged.has(key)) merged.set(key, value)
  })
  return merged
}

export function readAuthLinkType(): AuthLinkType {
  const params = readUrlAuthParams()
  const type = params.get('type')
  if (
    type === 'recovery' ||
    type === 'invite' ||
    type === 'signup' ||
    type === 'magiclink'
  ) {
    return type
  }
  return null
}

export function readAuthErrorFromUrl(): string | null {
  const params = readUrlAuthParams()
  const error = params.get('error_description') ?? params.get('error')
  if (!error) return null
  return decodeURIComponent(error.replace(/\+/g, ' '))
}

export function hasAuthErrorInUrl(): boolean {
  return readAuthErrorFromUrl() !== null
}

export function hasAuthParamsInUrl(): boolean {
  const params = readUrlAuthParams()
  return (
    params.has('code') ||
    params.has('access_token') ||
    params.has('refresh_token') ||
    params.has('token_hash')
  )
}

export function clearAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.hash = ''
  for (const key of [
    'code',
    'type',
    'token_hash',
    'access_token',
    'refresh_token',
    'expires_in',
    'token_type',
    'error',
    'error_description',
  ]) {
    url.searchParams.delete(key)
  }
  const nextSearch = url.searchParams.toString()
  window.history.replaceState(
    null,
    '',
    `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}`
  )
}

/** Troca code/tokens da URL por sessão ativa (convite, reset, confirmação). */
export async function establishSessionFromUrl(
  supabase: SupabaseClient
): Promise<{ sessionEstablished: boolean; linkType: AuthLinkType }> {
  const params = readUrlAuthParams()
  const linkType = readAuthLinkType()

  const code = params.get('code')
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
    if (data.session) {
      clearAuthParamsFromUrl()
      return { sessionEstablished: true, linkType }
    }
  }

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (error) throw error
    if (data.session) {
      clearAuthParamsFromUrl()
      return { sessionEstablished: true, linkType }
    }
  }

  const tokenHash = params.get('token_hash')
  const email = params.get('email')
  const type = params.get('type')
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'recovery' | 'invite' | 'signup' | 'email',
      ...(email ? { email } : {}),
    })
    if (error) throw error
    if (data.session) {
      clearAuthParamsFromUrl()
      return {
        sessionEstablished: true,
        linkType: readAuthLinkType() ?? linkType,
      }
    }
  }

  return { sessionEstablished: false, linkType }
}
