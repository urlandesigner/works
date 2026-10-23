import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../lib/supabase/client'
import {
  clearAuthParamsFromUrl,
  establishSessionFromUrl,
  hasAuthErrorInUrl,
  hasAuthParamsInUrl,
  readAuthErrorFromUrl,
  readAuthLinkType,
  type AuthLinkType,
} from '../lib/supabase/authCallback'
import {
  persistPendingPasswordAction,
  readPersistedPendingPasswordAction,
  type PendingPasswordAction,
} from '../lib/supabase/authPendingStorage'

export type { PendingPasswordAction }

export type SignInResult = { error: { message: string } | null }

export type SignUpResult = {
  error: { message: string } | null
  /** Quando o projeto Supabase exige confirmação por e-mail antes da sessão. */
  needsEmailConfirmation: boolean
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  authIssue: string | null
  configured: boolean
  pendingPasswordAction: PendingPasswordAction
  signInWithPassword: (email: string, password: string) => Promise<SignInResult>
  signUpWithPassword: (email: string, password: string) => Promise<SignUpResult>
  resendConfirmationEmail: (email: string) => Promise<SignInResult>
  requestPasswordReset: (email: string) => Promise<SignInResult>
  updatePassword: (password: string) => Promise<SignInResult>
  abandonPasswordSetup: () => Promise<void>
  clearAuthIssue: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.trim()
    if (/failed to fetch/i.test(message) || /networkerror/i.test(message)) {
      return 'Nao foi possivel conectar ao Supabase. Verifique a URL do projeto, sua internet e tente novamente.'
    }
    if (message) return message
  }
  return 'Nao foi possivel concluir a autenticacao agora. Tente novamente em instantes.'
}

function toSignInErrorMessage(message: string): string {
  const normalized = message.trim().toLowerCase()
  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid_credentials')
  ) {
    return 'E-mail ou senha incorretos — ou a conta ainda não foi confirmada. Confira o link no e-mail (inclusive spam) ou peça reenvio abaixo.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Verifique a caixa de entrada e o spam, ou reenvie o link de confirmação.'
  }
  return message
}

function toSignUpErrorMessage(message: string): string {
  const normalized = message.trim().toLowerCase()
  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'Este e-mail já está cadastrado. Tente entrar ou use "Esqueci minha senha".'
  }
  if (normalized.includes('password')) {
    return 'Senha não atende aos requisitos do Supabase. Use pelo menos 6 caracteres.'
  }
  return message
}

function toPasswordResetErrorMessage(message: string): string {
  const normalized = message.trim().toLowerCase()
  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'
  }
  if (normalized.includes('email') && normalized.includes('not authorized')) {
    return 'O Supabase só envia e-mail para endereços autorizados no projeto. Configure SMTP customizado no painel.'
  }
  return message
}

function toAuthUrlErrorMessage(message: string): string {
  const normalized = message.trim().toLowerCase()
  if (normalized.includes('expired') || normalized.includes('invalid')) {
    return 'Link expirado ou inválido. Solicite um novo convite ou redefinição de senha.'
  }
  return message
}

function getEmailRedirectTo(): string | undefined {
  const fromEnv = import.meta.env.VITE_APP_URL?.trim()
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin
  return undefined
}

function getAuthCallbackUrl(): string | undefined {
  const base = getEmailRedirectTo()
  if (!base) return undefined
  return `${base.replace(/\/$/, '')}/login`
}

function linkTypeToPendingAction(
  linkType: AuthLinkType
): PendingPasswordAction {
  if (linkType === 'recovery') return 'recovery'
  if (linkType === 'invite') return 'invite'
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authIssue, setAuthIssue] = useState<string | null>(null)
  const [pendingPasswordAction, setPendingPasswordActionState] =
    useState<PendingPasswordAction>(() => {
      const fromUrl = linkTypeToPendingAction(readAuthLinkType())
      if (fromUrl) return fromUrl
      return readPersistedPendingPasswordAction()
    })
  const configured = isSupabaseConfigured()

  const setPendingPasswordAction = useCallback(
    (action: PendingPasswordAction) => {
      setPendingPasswordActionState(action)
      persistPendingPasswordAction(action)
    },
    []
  )

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (!client) {
      setSession(null)
      setAuthIssue(null)
      setLoading(false)
      return
    }

    let cancelled = false
    let initialSessionSeen = false

    const finishLoading = () => {
      if (!cancelled) setLoading(false)
    }

    const applyPendingForSession = (
      _nextSession: Session | null,
      explicit?: PendingPasswordAction
    ) => {
      if (explicit) {
        setPendingPasswordAction(explicit)
        return
      }
      const persisted = readPersistedPendingPasswordAction()
      if (persisted) setPendingPasswordAction(persisted)
    }

    if (hasAuthErrorInUrl()) {
      const urlError = readAuthErrorFromUrl()
      setAuthIssue(urlError ? toAuthUrlErrorMessage(urlError) : 'Link de autenticação inválido.')
      clearAuthParamsFromUrl()
    }

    void (async () => {
      try {
        if (hasAuthParamsInUrl()) {
          const { sessionEstablished, linkType } =
            await establishSessionFromUrl(client)
          if (sessionEstablished) {
            applyPendingForSession(null, linkTypeToPendingAction(linkType))
          } else if (!cancelled) {
            setAuthIssue(
              'Não foi possível validar o link do e-mail. Solicite um novo convite ou redefinição de senha.'
            )
          }
        }
      } catch (error: unknown) {
        console.error('Falha ao processar link de autenticacao.', error)
        if (!cancelled) {
          setAuthIssue(toAuthErrorMessage(error))
        }
      }
    })()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)

      if (event === 'PASSWORD_RECOVERY') {
        setPendingPasswordAction('recovery')
      }

      if (event === 'SIGNED_IN') {
        const fromUrl = linkTypeToPendingAction(readAuthLinkType())
        if (fromUrl) {
          setPendingPasswordAction(fromUrl)
        } else {
          applyPendingForSession(newSession)
        }
      }

      if (event === 'SIGNED_OUT') {
        setPendingPasswordAction(null)
      }

      if (event === 'INITIAL_SESSION') {
        initialSessionSeen = true
        if (newSession) {
          applyPendingForSession(newSession)
        }
        finishLoading()
      }
    })

    const fallbackTimer = window.setTimeout(() => {
      if (!initialSessionSeen) finishLoading()
    }, 4000)

    return () => {
      cancelled = true
      window.clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [configured, setPendingPasswordAction])

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) return { error: { message: 'Supabase não configurado.' } }
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        return {
          error: error
            ? { message: toSignInErrorMessage(error.message) }
            : null,
        }
      } catch (error: unknown) {
        return { error: { message: toAuthErrorMessage(error) } }
      }
    },
    []
  )

  const signUpWithPassword = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) {
        return {
          error: { message: 'Supabase não configurado.' },
          needsEmailConfirmation: false,
        }
      }
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: getAuthCallbackUrl() ?? getEmailRedirectTo(),
          },
        })
        return {
          error: error
            ? { message: toSignUpErrorMessage(error.message) }
            : null,
          needsEmailConfirmation: Boolean(!error && data.user && !data.session),
        }
      } catch (error: unknown) {
        return {
          error: { message: toAuthErrorMessage(error) },
          needsEmailConfirmation: false,
        }
      }
    },
    []
  )

  const resendConfirmationEmail = useCallback(
    async (email: string): Promise<SignInResult> => {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) return { error: { message: 'Supabase não configurado.' } }
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: {
            emailRedirectTo: getAuthCallbackUrl() ?? getEmailRedirectTo(),
          },
        })
        return { error: error ? { message: error.message } : null }
      } catch (error: unknown) {
        return { error: { message: toAuthErrorMessage(error) } }
      }
    },
    []
  )

  const requestPasswordReset = useCallback(
    async (email: string): Promise<SignInResult> => {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) return { error: { message: 'Supabase não configurado.' } }
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: getAuthCallbackUrl() ?? getEmailRedirectTo(),
          }
        )
        return {
          error: error
            ? { message: toPasswordResetErrorMessage(error.message) }
            : null,
        }
      } catch (error: unknown) {
        return { error: { message: toAuthErrorMessage(error) } }
      }
    },
    []
  )

  const updatePassword = useCallback(
    async (password: string): Promise<SignInResult> => {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) return { error: { message: 'Supabase não configurado.' } }
      try {
        let {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (!currentSession && hasAuthParamsInUrl()) {
          await establishSessionFromUrl(supabase)
          ;({
            data: { session: currentSession },
          } = await supabase.auth.getSession())
        }

        if (!currentSession) {
          return {
            error: {
              message:
                'Sessão do link expirou ou não foi encontrada. Abra o link do e-mail novamente ou solicite um novo.',
            },
          }
        }

        const { error } = await supabase.auth.updateUser({ password })
        if (!error) setPendingPasswordAction(null)
        return { error: error ? { message: error.message } : null }
      } catch (error: unknown) {
        return { error: { message: toAuthErrorMessage(error) } }
      }
    },
    [setPendingPasswordAction]
  )

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    setPendingPasswordAction(null)
    setAuthIssue(null)
    setSession(null)
    if (!supabase) return
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Falha ao encerrar sessao.', error)
      try {
        await supabase.auth.signOut({ scope: 'local' })
      } catch {
        // estado local já foi limpo
      }
    }
  }, [setPendingPasswordAction])

  const abandonPasswordSetup = useCallback(async () => {
    await signOut()
  }, [signOut])

  const clearAuthIssue = useCallback(() => {
    setAuthIssue(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      authIssue,
      configured,
      pendingPasswordAction,
      signInWithPassword,
      signUpWithPassword,
      resendConfirmationEmail,
      requestPasswordReset,
      updatePassword,
      abandonPasswordSetup,
      clearAuthIssue,
      signOut,
    }),
    [
      session,
      loading,
      authIssue,
      configured,
      pendingPasswordAction,
      signInWithPassword,
      signUpWithPassword,
      resendConfirmationEmail,
      requestPasswordReset,
      updatePassword,
      abandonPasswordSetup,
      clearAuthIssue,
      signOut,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}
