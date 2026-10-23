import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProfileAvatar } from '../components/profile/ProfileAvatar'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { Camera, Check } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Informe seu nome'),
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  phone: z.string(),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const {
    profile,
    displayAvatarUrl,
    sessionAvatarUrl,
    setSessionAvatarFromFile,
    updateProfile,
  } = useUserProfile()
  const { setTitle } = useHeaderActions()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    },
  })

  const nameWatch = watch('name')

  useEffect(() => {
    setTitle('Perfil', 'Seus dados e foto')
    return () => setTitle('', null)
  }, [setTitle])

  useEffect(() => {
    reset({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    })
  }, [profile.name, profile.email, profile.phone, reset])

  const hasPhotoToShow = Boolean(sessionAvatarUrl)

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem (JPEG, PNG, WebP ou GIF).')
      return
    }
    setSessionAvatarFromFile(file)
    setSaveState('idle')
  }

  const onRemovePhoto = () => {
    setSessionAvatarFromFile(null)
    setSaveState('idle')
  }

  const onSubmit = async (data: FormData) => {
    const result = await updateProfile({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    })

    if (result.ok) {
      reset({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      })
      setSaveState('success')
      window.setTimeout(() => setSaveState('idle'), 2500)
      return
    }

    setSaveState('error')
    alert(result.userMessage)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="overflow-hidden p-0 shadow-sm ring-1 ring-slate-100/80 dark:ring-white/[0.06]">
        <div className="relative border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-brand-50/40 px-6 py-10 sm:px-10 dark:border-white/[0.08] dark:from-zinc-900/70 dark:via-zinc-900/85 dark:to-zinc-800/60">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
            <div className="relative">
              <ProfileAvatar
                size="lg"
                src={displayAvatarUrl}
                name={nameWatch || profile.name || ' '}
              />
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {nameWatch?.trim() || 'Seu nome'}
              </p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-ds-muted">
                Nome e telefone são salvos na sua conta (Supabase: perfil e
                metadados do login). O e-mail segue o Auth; alterações podem exigir
                confirmação. A foto escolhida aqui é só nesta sessão no navegador.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  aria-label="Selecionar foto de perfil"
                  onChange={onPickFile}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  {hasPhotoToShow ? 'Trocar foto' : 'Adicionar foto'}
                </Button>
                {hasPhotoToShow && (
                  <button
                    type="button"
                    onClick={onRemovePhoto}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ds-muted transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-slate-100"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 px-6 py-8 sm:px-10"
          noValidate
        >
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
              Contato
            </h2>
            <p className="mt-1 text-sm text-ds-muted">
              Use dados que você reconheça facilmente em extratos e alertas.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="ui-label">
                Nome
              </label>
              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                {...register('name')}
                className="ui-field"
                placeholder="Como prefere ser chamado"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="profile-phone" className="ui-label">
                Telefone
              </label>
              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                {...register('phone')}
                className="ui-field tabular-nums"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="ui-label">
                E-mail
              </label>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="ui-field"
                placeholder="voce@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
            <div className="min-h-[1.25rem] text-sm">
              {saveState === 'success' && (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                  Alterações salvas
                </span>
              )}
              {saveState === 'error' && (
                <span className="text-danger-500">
                  Não foi possível salvar. Tente novamente.
                </span>
              )}
            </div>
            <Button type="submit" disabled={!isDirty}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
