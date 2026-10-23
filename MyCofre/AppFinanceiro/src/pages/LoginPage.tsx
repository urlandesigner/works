import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { branding } from '../../config/branding'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'signup' | 'forgot'
type InfoKind = 'confirmation' | 'reset' | null

export function LoginPage() {
  const {
    session,
    user,
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
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as
    | { from?: string | { pathname?: string | null } | null }
    | null
    | undefined

  const fromRaw = state?.from
  const from =
    (typeof fromRaw === 'string' ? fromRaw.trim() : fromRaw?.pathname?.trim()) ||
    '/dashboard'

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [infoKind, setInfoKind] = useState<InfoKind>(null)

  useEffect(() => {
    if (user?.email && (pendingPasswordAction || mode === 'forgot')) {
      setEmail(user.email)
    }
  }, [user?.email, pendingPasswordAction, mode])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e4e6ed] px-4 dark:bg-[#121212]">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 dark:border-zinc-600 dark:border-t-brand-400"
          aria-hidden
        />
      </div>
    )
  }

  if (session && !pendingPasswordAction) {
    return <Navigate to={from} replace />
  }

  const needsNewPassword = Boolean(pendingPasswordAction)
  const canSetPassword = needsNewPassword && Boolean(user)

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setFormError(null)
    setInfoMessage(null)
    setInfoKind(null)
    clearAuthIssue()
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setInfoMessage(null)

    if (!password || password.length < 6) {
      setFormError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setFormError('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await updatePassword(password)
      if (error) {
        setFormError(error.message)
        return
      }
      setPassword('')
      setConfirmPassword('')
      navigate(from, { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setInfoMessage(null)
    clearAuthIssue()

    if (!email.trim()) {
      setFormError('Informe seu e-mail para receber o link de redefinição.')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await requestPasswordReset(email)
      if (error) {
        setFormError(error.message)
        return
      }
      setInfoMessage(
        'Link de redefinição enviado. Abra o e-mail, clique no link e defina a nova senha nesta tela.'
      )
      setInfoKind('reset')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-400 dark:disabled:bg-zinc-800 dark:disabled:text-slate-500'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setInfoMessage(null)
    clearAuthIssue()

    if (!configured) {
      setFormError(
        'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env e reinicie o servidor.'
      )
      return
    }

    if (!email.trim() || !password) {
      setFormError('Preencha e-mail e senha.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        const { error } = await signInWithPassword(email, password)
        if (error) {
          setFormError(error.message)
          return
        }
        navigate(from, { replace: true })
        return
      }

      const { error, needsEmailConfirmation } = await signUpWithPassword(
        email,
        password
      )
      if (error) {
        setFormError(error.message)
        return
      }
      if (needsEmailConfirmation) {
        setInfoMessage(
          'Conta criada. Confirme o link enviado ao seu e-mail para ativar o acesso.'
        )
        setInfoKind('confirmation')
        setPassword('')
        return
      }
      navigate(from, { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendConfirmation() {
    setFormError(null)
    if (!email.trim()) {
      setFormError('Informe o e-mail usado no cadastro para reenviar a confirmação.')
      return
    }
    setResending(true)
    try {
      const { error } = await resendConfirmationEmail(email)
      if (error) {
        setFormError(error.message)
        return
      }
      setInfoMessage('Link de confirmação reenviado. Verifique sua caixa de entrada e o spam.')
      setInfoKind('confirmation')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#e4e6ed] px-4 py-10 dark:bg-[#121212]">
      <div
        className="pointer-events-none fixed inset-0 -z-10 dark:hidden"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 100% 80% at 50% -30%, rgb(248 250 252 / 0.85) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgb(241 245 249 / 0.5) 0%, transparent 45%)',
          backgroundAttachment: 'fixed',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 100% 85% at 50% -35%, rgb(39 39 42 / 0.45) 0%, transparent 58%), radial-gradient(ellipse 55% 45% at 100% 0%, rgb(24 24 27 / 0.55) 0%, transparent 48%)',
          backgroundAttachment: 'fixed',
        }}
      />

      <div className="mb-8 flex flex-col items-center gap-3 text-center text-slate-800 dark:text-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-card-sm ring-1 ring-slate-900/5 dark:bg-zinc-800 dark:ring-white/10">
            <Wallet className="h-5 w-5 text-slate-700 dark:text-slate-200" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            {branding.name}
          </span>
        </div>
        <p className="max-w-sm text-sm text-ds-muted">{branding.tagline}</p>
      </div>

      <Card className="w-full max-w-md shadow-card ring-1 ring-slate-900/[0.03] dark:ring-white/[0.06]">
        <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {needsNewPassword
            ? pendingPasswordAction === 'recovery'
              ? 'Definir nova senha'
              : 'Ativar convite'
            : mode === 'login'
              ? 'Entrar'
              : mode === 'signup'
                ? 'Criar conta'
                : 'Esqueci minha senha'}
        </h1>
        <p className="mt-1 text-sm text-ds-muted">
          {needsNewPassword
            ? pendingPasswordAction === 'recovery'
              ? 'Você abriu o link de redefinição. Escolha uma nova senha para concluir.'
              : 'Você abriu o link de convite. Defina sua senha para ativar o acesso.'
            : mode === 'login'
              ? 'Use seu e-mail e senha para acessar seus dados.'
              : mode === 'signup'
                ? 'Cadastre-se com e-mail e senha. Você poderá sincronizar dados no futuro.'
                : 'Enviaremos um link para você redefinir a senha.'}
        </p>

        {!configured ? (
          <div
            className="mt-4 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100"
            role="alert"
          >
            <p className="font-medium">Supabase não configurado</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
              Crie um arquivo <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">.env</code>{' '}
              na raiz do projeto com{' '}
              <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">VITE_SUPABASE_URL</code> e{' '}
              <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">
                VITE_SUPABASE_ANON_KEY
              </code>
              . Veja <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">.env.example</code>.
            </p>
          </div>
        ) : null}

        {configured && authIssue && !formError ? (
          <div
            className="mt-4 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100"
            role="alert"
          >
            <p className="font-medium">
              {needsNewPassword || mode === 'forgot'
                ? 'Problema no link de autenticação'
                : 'Falha de conexao com a autenticacao'}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
              {authIssue}
            </p>
          </div>
        ) : null}

        {needsNewPassword && !canSetPassword ? (
          <div
            className="mt-4 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100"
            role="alert"
          >
            <p className="font-medium">Link inválido ou expirado</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
              Abra o link do e-mail novamente em uma aba nova. Se o erro continuar, solicite um
              novo convite ou redefinição de senha.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold underline underline-offset-2"
              onClick={() => void abandonPasswordSetup().then(() => switchMode('forgot'))}
            >
              Solicitar novo link
            </button>
          </div>
        ) : null}

        <form
          className="mt-6 space-y-4"
          onSubmit={
            needsNewPassword
              ? handleSetPassword
              : mode === 'forgot'
                ? handleForgotPassword
                : handleSubmit
          }
          noValidate
        >
          {!needsNewPassword ? (
            <div>
              <label htmlFor="auth-email" className="ui-label">
                E-mail
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                disabled={submitting || mode === 'forgot' && Boolean(user?.email)}
                placeholder="voce@email.com"
              />
            </div>
          ) : user?.email ? (
            <p className="text-sm text-ds-muted">
              Conta: <span className="font-medium text-slate-800 dark:text-slate-200">{user.email}</span>
            </p>
          ) : null}
          {needsNewPassword || mode !== 'forgot' ? (
            <div>
              <label htmlFor="auth-password" className="ui-label">
                {needsNewPassword ? 'Nova senha' : 'Senha'}
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={needsNewPassword || mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                disabled={submitting}
                placeholder="••••••••"
                minLength={6}
              />
              {mode === 'signup' || needsNewPassword ? (
                <p className="mt-1 text-xs text-ds-muted">
                  Mínimo de 6 caracteres (requisito comum do Supabase; ajuste as políticas no
                  painel se precisar).
                </p>
              ) : null}
            </div>
          ) : null}
          {needsNewPassword ? (
            <div>
              <label htmlFor="auth-confirm-password" className="ui-label">
                Confirmar senha
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                disabled={submitting}
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          ) : null}

          {formError ? (
            <p
              className="rounded-lg border border-red-200/90 bg-red-50/90 px-3 py-2 text-sm text-red-900 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-100"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          {infoMessage ? (
            <div
              className="rounded-lg border border-emerald-200/90 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/35 dark:text-emerald-100"
              role="status"
            >
              <p>{infoMessage}</p>
              {infoKind === 'confirmation' ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold underline underline-offset-2 disabled:opacity-60"
                  onClick={() => void handleResendConfirmation()}
                  disabled={resending || !email.trim()}
                >
                  {resending ? 'Reenviando…' : 'Reenviar link de confirmação'}
                </button>
              ) : null}
            </div>
          ) : null}

          {mode === 'login' && formError?.includes('confirmada') ? (
            <button
              type="button"
              className="w-full text-center text-xs font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900 disabled:opacity-60 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => void handleResendConfirmation()}
              disabled={resending || !email.trim()}
            >
              {resending ? 'Reenviando link…' : 'Reenviar link de confirmação por e-mail'}
            </button>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            loading={submitting}
            disabled={!configured || (needsNewPassword && !canSetPassword)}
          >
            {needsNewPassword
              ? 'Salvar senha e entrar'
              : mode === 'login'
                ? 'Entrar'
                : mode === 'signup'
                  ? 'Cadastrar'
                  : 'Enviar link de redefinição'}
          </Button>
        </form>

        {!needsNewPassword ? (
        <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600 dark:border-white/[0.08] dark:text-slate-400">
          {mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button
                type="button"
                className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 transition hover:decoration-slate-500 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-400"
                onClick={() => switchMode('signup')}
              >
                Cadastre-se
              </button>
              <span className="mx-2 text-slate-300 dark:text-zinc-600">·</span>
              <button
                type="button"
                className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 transition hover:decoration-slate-500 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-400"
                onClick={() => switchMode('forgot')}
              >
                Esqueci minha senha
              </button>
            </>
          ) : mode === 'signup' ? (
            <>
              Já tem conta?{' '}
              <button
                type="button"
                className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 transition hover:decoration-slate-500 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-400"
                onClick={() => switchMode('login')}
              >
                Entrar
              </button>
            </>
          ) : (
            <>
              Lembrou a senha?{' '}
              <button
                type="button"
                className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 transition hover:decoration-slate-500 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-400"
                onClick={() => switchMode('login')}
              >
                Voltar ao login
              </button>
            </>
          )}
        </p>
        ) : null}

        <p className="mt-4 text-center text-xs text-ds-faint">
          Os dados financeiros continuam locais nesta etapa; a conta prepara a futura
          sincronização.
        </p>
      </Card>

      <p className="mt-6 text-center text-xs text-ds-muted">
        <a
          href="https://supabase.com/docs/guides/auth"
          className="underline decoration-slate-300 underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          target="_blank"
          rel="noreferrer"
        >
          Documentação Supabase Auth
        </a>
      </p>
    </div>
  )
}
