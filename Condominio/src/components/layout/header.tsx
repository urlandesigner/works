"use client"

import { usePathname } from "next/navigation"

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/comunicados": "Comunicados",
  "/chamados": "Chamados",
  "/reservas": "Reservas",
  "/encomendas": "Encomendas",
  "/visitantes": "Visitantes",
  "/mensagens": "Mensagens",
  "/comunidade": "Comunidade",
}

export function Header() {
  const pathname = usePathname()
  const base = "/" + pathname.split("/")[1]
  const title = titles[base] ?? "Sistema"

  return (
    <header className="h-14 border-b bg-white flex items-center px-6">
      <h1 className="text-sm font-semibold">{title}</h1>
    </header>
  )
}
