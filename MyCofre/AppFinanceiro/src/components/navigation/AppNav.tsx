import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  Repeat,
  CreditCard,
  Target,
  BarChart3,
  FileUp,
  Receipt,
  Sparkles,
} from 'lucide-react'
import type { FeatureFlagKey } from '../../config/feature-flags'
import { isFeatureEnabled } from '../../config/feature-flags'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  /** Se definido, o item só aparece com a flag ativa. */
  flag?: FeatureFlagKey
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { to: '/accounts', label: 'Contas', icon: Wallet },
  { to: '/investments', label: 'Investimentos', icon: TrendingUp },
  { to: '/subscriptions', label: 'Assinaturas', icon: Repeat },
  { to: '/credit-cards', label: 'Cartões', icon: CreditCard },
  { to: '/goals', label: 'Metas', icon: Target },
  { to: '/reports', label: 'Relatórios', icon: BarChart3, flag: 'reports' },
  {
    to: '/importar-extrato',
    label: 'Importar Extrato',
    icon: FileUp,
    flag: 'import_statement',
  },
  {
    to: '/faturas/importar',
    label: 'Importar fatura',
    icon: Receipt,
    flag: 'import_invoice',
  },
  {
    to: '/assistente-financeiro',
    label: 'Assistente',
    icon: Sparkles,
    flag: 'assistant',
  },
]

const visibleNavItems = navItems.filter(
  (item) => !item.flag || isFeatureEnabled(item.flag)
)

interface AppNavProps {
  collapsed?: boolean
  /** Fundo escuro (sidebar / drawer). */
  variant?: 'light' | 'dark'
  /** Chamado ao navegar (ex.: fechar drawer mobile). */
  onNavigate?: () => void
}

export function AppNav({
  collapsed = false,
  variant = 'light',
  onNavigate,
}: AppNavProps) {
  const isDark = variant === 'dark'

  return (
    <nav className="flex flex-col gap-1" aria-label="Principal">
      {visibleNavItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'flex items-center rounded-xl py-2.5 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
              collapsed ? 'justify-center px-0' : 'gap-3 px-3',
              isDark &&
                (isActive
                  ? 'bg-[#1F1F1F] text-white focus-visible:ring-white/20'
                  : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white focus-visible:ring-white/20'),
              !isDark &&
                (isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400/40')
            )
          }
          end={to === '/dashboard'}
          title={collapsed ? label : undefined}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}
