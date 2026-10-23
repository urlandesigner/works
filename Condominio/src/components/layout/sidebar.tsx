"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Bell,
  Wrench,
  Calendar,
  Package,
  Users,
  MessageSquare,
  Globe,
  LayoutDashboard,
  Building2,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/comunicados", label: "Comunicados", icon: Bell },
  { href: "/chamados", label: "Chamados", icon: Wrench },
  { href: "/reservas", label: "Reservas", icon: Calendar },
  { href: "/encomendas", label: "Encomendas", icon: Package },
  { href: "/visitantes", label: "Visitantes", icon: Users },
  { href: "/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/comunidade", label: "Comunidade", icon: Globe },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r bg-white flex flex-col">
      <div className="flex items-center gap-2 px-5 py-4 border-b">
        <Building2 className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Condomínio</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
