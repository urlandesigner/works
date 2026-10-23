import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '../types'
import type { SaveUserProfileResult } from '../lib/storage'
import { useAuth } from './AuthContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import {
  fetchProfileRow,
  upsertProfileRow,
  type ProfileRow,
} from '../lib/supabase/profilesRepo'
import { DEFAULT_USER_PROFILE } from '../types/user-profile'

interface UserProfileContextValue {
  profile: UserProfile
  /** Avatar remoto (metadata Auth ou tabela `profiles`). */
  profileAvatarUrl: string | null
  /** Preview local (arquivo escolhido nesta sessão). */
  sessionAvatarUrl: string | null
  /** Preferência de exibição: sessão > remoto. */
  displayAvatarUrl: string | null
  setSessionAvatarFromFile: (file: File | null) => void
  updateProfile: (patch: Partial<UserProfile>) => Promise<SaveUserProfileResult>
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null)

function displayNameFromUser(user: User): string {
  const m = user.user_metadata
  if (m && typeof m.full_name === 'string' && m.full_name.trim()) {
    return m.full_name.trim()
  }
  if (m && typeof m.name === 'string' && m.name.trim()) {
    return m.name.trim()
  }
  const local = user.email?.split('@')[0]
  return local?.trim() || 'Usuário'
}

function phoneFromUser(user: User): string {
  const m = user.user_metadata
  if (m && typeof m.phone === 'string') return m.phone
  return ''
}

function avatarFromUserAndRow(user: User, row: ProfileRow | null): string | null {
  const fromRow = row?.avatar_url?.trim()
  if (fromRow) return fromRow
  const m = user.user_metadata
  if (m && typeof m.avatar_url === 'string' && m.avatar_url.trim()) {
    return m.avatar_url.trim()
  }
  return null
}

function mergeUserProfile(user: User, row: ProfileRow | null): UserProfile {
  const name =
    (row?.full_name && row.full_name.trim()) || displayNameFromUser(user)
  const phone = (row?.phone && row.phone.trim()) || phoneFromUser(user)
  const email = user.email ?? ''
  return {
    name,
    email,
    phone,
    updated_at: row?.updated_at ?? undefined,
  }
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, session } = useAuth()
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null)
  const [sessionAvatarUrl, setSessionAvatarUrl] = useState<string | null>(null)
  const sessionBlobUrlRef = useRef<string | null>(null)
  const profileRef = useRef(profile)
  const profileRowRef = useRef<ProfileRow | null>(null)
  const lastUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const clearSessionBlob = useCallback(() => {
    if (sessionBlobUrlRef.current) {
      URL.revokeObjectURL(sessionBlobUrlRef.current)
      sessionBlobUrlRef.current = null
    }
    setSessionAvatarUrl(null)
  }, [])

  const setSessionAvatarFromFile = useCallback(
    (file: File | null) => {
      clearSessionBlob()
      if (!file) return
      const url = URL.createObjectURL(file)
      sessionBlobUrlRef.current = url
      setSessionAvatarUrl(url)
    },
    [clearSessionBlob]
  )

  useEffect(() => {
    return () => {
      if (sessionBlobUrlRef.current) {
        URL.revokeObjectURL(sessionBlobUrlRef.current)
      }
    }
  }, [])

  // Troca de usuário: limpar blob local e linha cacheada do perfil anterior.
  useEffect(() => {
    const uid = user?.id ?? null
    if (uid !== lastUserIdRef.current) {
      lastUserIdRef.current = uid
      profileRowRef.current = null
      clearSessionBlob()
    }
  }, [user?.id, clearSessionBlob])

  // Carregar perfil alinhado ao Auth + opcionalmente `public.profiles`.
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      profileRowRef.current = null
      setProfile({ ...DEFAULT_USER_PROFILE })
      setProfileAvatarUrl(null)
      return
    }

    profileRowRef.current = null
    setProfile(mergeUserProfile(user, null))
    setProfileAvatarUrl(avatarFromUserAndRow(user, null))

    const client = getSupabaseBrowserClient()
    if (!client) return

    let cancelled = false
    void (async () => {
      const { data: row, error } = await fetchProfileRow(client, user.id)
      if (cancelled) return
      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[UserProfileContext] profiles:', error.message)
        }
        return
      }
      profileRowRef.current = row
      setProfile(mergeUserProfile(user, row))
      setProfileAvatarUrl(avatarFromUserAndRow(user, row))
    })()

    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  // Mesmo usuário: alinhar à sessão quando o token/metadata mudar (ex.: após salvar no perfil).
  useEffect(() => {
    if (authLoading || !user?.id) return
    setProfile(mergeUserProfile(user, profileRowRef.current))
    setProfileAvatarUrl(avatarFromUserAndRow(user, profileRowRef.current))
  }, [authLoading, user, session?.access_token])

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>): Promise<SaveUserProfileResult> => {
      const client = getSupabaseBrowserClient()
      if (!client) {
        return {
          ok: false,
          reason: 'not_configured',
          userMessage: 'Supabase não configurado.',
        }
      }
      if (!user?.id) {
        return {
          ok: false,
          reason: 'auth',
          userMessage: 'Sessão inválida. Faça login novamente.',
        }
      }

      const prev = profileRef.current
      const name =
        patch.name !== undefined ? patch.name.trim() : prev.name
      const phone =
        patch.phone !== undefined ? patch.phone.trim() : prev.phone
      const email =
        patch.email !== undefined ? patch.email.trim() : prev.email

      const { error: profileErr } = await upsertProfileRow(client, user.id, {
        full_name: name,
        phone,
      })
      if (profileErr && import.meta.env.DEV) {
        console.warn('[UserProfileContext] upsert profiles:', profileErr.message)
      }

      const authPayload: {
        data: Record<string, string>
        email?: string
      } = {
        data: { full_name: name, phone },
      }
      if (email !== user.email) {
        authPayload.email = email
      }

      const { error: authUpdateErr } = await client.auth.updateUser(authPayload)
      if (authUpdateErr) {
        return {
          ok: false,
          reason: 'auth',
          userMessage: authUpdateErr.message,
        }
      }

      const { data: sessionData } = await client.auth.getSession()
      const sessionUser = sessionData.session?.user ?? user

      const nextRow: ProfileRow = {
        id: user.id,
        full_name: name,
        phone,
        avatar_url: profileRowRef.current?.avatar_url ?? null,
        updated_at: new Date().toISOString(),
      }
      profileRowRef.current = nextRow

      const nextProfile = mergeUserProfile(sessionUser, nextRow)
      profileRef.current = nextProfile
      setProfile(nextProfile)
      setProfileAvatarUrl(avatarFromUserAndRow(sessionUser, nextRow))

      return { ok: true }
    },
    [user]
  )

  const displayAvatarUrl = sessionAvatarUrl ?? profileAvatarUrl

  const value = useMemo<UserProfileContextValue>(
    () => ({
      profile,
      profileAvatarUrl,
      sessionAvatarUrl,
      displayAvatarUrl,
      setSessionAvatarFromFile,
      updateProfile,
    }),
    [
      profile,
      profileAvatarUrl,
      sessionAvatarUrl,
      displayAvatarUrl,
      setSessionAvatarFromFile,
      updateProfile,
    ]
  )

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext)
  if (!ctx) {
    throw new Error('useUserProfile must be used within UserProfileProvider')
  }
  return ctx
}
