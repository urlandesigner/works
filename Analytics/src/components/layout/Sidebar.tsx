import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: JSX.Element;
  end?: boolean;
}

const iconClass = 'h-4 w-4 shrink-0';

const topItems: NavItem[] = [
  {
    to: '/',
    label: 'Visão geral',
    end: true,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12l9-9 9 9" /><path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    to: '/sites',
    label: 'Sites',
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="6" rx="1" /><rect x="3" y="14" width="18" height="6" rx="1" />
      </svg>
    ),
  },
];

const bottomItem: NavItem = {
  to: '/configuracoes',
  label: 'Configurações',
  icon: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.3-2.6H9.4l-.3 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.6h4.2l.3-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z" />
    </svg>
  ),
};

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap',
    isActive ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
  ].join(' ');
}

export function Sidebar() {
  return (
    <aside className="shrink-0 border-b border-zinc-200 bg-white lg:flex lg:h-screen lg:w-56 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:mb-6 lg:block lg:px-3">
        <div className="flex items-center gap-2 px-0 lg:px-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-xs font-semibold text-white">
            UD
          </div>
          <span className="text-sm font-semibold text-zinc-900">Analytics</span>
        </div>

        <div className="lg:hidden">
          <NavLink to={bottomItem.to} className={linkClass}>
            {bottomItem.icon}
            {bottomItem.label}
          </NavLink>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:px-3 lg:pb-0">
        {topItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden px-3 py-4 lg:block">
        <NavLink to={bottomItem.to} className={linkClass}>
          {bottomItem.icon}
          {bottomItem.label}
        </NavLink>
      </div>
    </aside>
  );
}
