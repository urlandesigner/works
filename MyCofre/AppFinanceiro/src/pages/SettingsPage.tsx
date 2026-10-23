import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { importAppFinanceiroDataFromObject } from '../lib/importAppData'
import { Moon, Sun, Upload } from 'lucide-react'
import type { ThemePreference } from '../lib/themeStorage'

const themeOptions: {
  value: ThemePreference
  label: string
  description: string
  icon: typeof Sun
}[] = [
  {
    value: 'light',
    label: 'Claro',
    description: 'Fundo claro e alto contraste diurno.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Escuro',
    description: 'Base grafite, alinhada ao menu lateral.',
    icon: Moon,
  },
]

export function SettingsPage() {
  const { setActions, setTitle } = useHeaderActions()
  const { theme, setTheme } = useTheme()
  const { success, error } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    setTitle('Configurações')
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(null)
    return () => setActions(null)
  }, [setActions])

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)

    const reader = new FileReader()
    reader.onload = () => {
      setImporting(false)
      try {
        const text = reader.result
        if (typeof text !== 'string') return
        const data = JSON.parse(text) as Record<string, unknown>
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          error('Arquivo inválido: o JSON deve ser um objeto com chaves do app.')
          return
        }
        const result = importAppFinanceiroDataFromObject(
          data as Record<string, unknown>
        )
        if (!result.ok) {
          error(result.message)
          return
        }
        success('Dados importados. Recarregando o app…')
        window.setTimeout(() => window.location.reload(), 500)
      } catch {
        error('Não foi possível ler o arquivo. Confira se é um JSON válido.')
      }
    }
    reader.onerror = () => {
      setImporting(false)
      error('Falha ao acessar o arquivo. Tente novamente.')
    }
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="card-prose">
          Preferências do aplicativo. A escolha de tema é salva neste
          dispositivo.
        </p>
      </Card>

      <Card>
        <h2 className="card-block-heading">Aparência</h2>
        <p className="card-prose mb-4">Escolha entre tema claro e escuro.</p>
        <div
          role="radiogroup"
          aria-label="Tema da interface"
          className="grid gap-3 sm:grid-cols-2"
        >
          {themeOptions.map(({ value, label, description, icon: Icon }) => {
            const selected = theme === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(value)}
                className={clsx(
                  'flex w-full flex-col items-start gap-2 rounded-xl border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900',
                  selected
                    ? 'border-brand-600 bg-brand-50 shadow-sm ring-1 ring-brand-600/20 dark:border-zinc-500 dark:bg-zinc-800/80 dark:ring-white/10'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80 dark:border-white/[0.1] dark:bg-zinc-900/40 dark:hover:border-white/[0.14] dark:hover:bg-zinc-800/50'
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      selected
                        ? 'bg-brand-600 text-white dark:bg-zinc-600'
                        : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="font-display text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {label}
                  </span>
                </span>
                <span className="text-xs leading-snug text-gray-600 dark:text-slate-400">
                  {description}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <h2 className="card-block-heading">Importar dados</h2>
        <p className="card-prose mb-4">
          Selecione um arquivo JSON exportado anteriormente. Os dados atuais
          serão substituídos e a página será recarregada.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden
        />
        <Button type="button" loading={importing} onClick={handleImportClick}>
          {!importing ? <Upload className="h-4 w-4" /> : null}
          {importing ? 'Importando…' : 'Importar dados'}
        </Button>
      </Card>
    </div>
  )
}
