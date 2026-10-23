import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CategoriaComunicado } from "@/lib/mock/comunicados"

const config: Record<CategoriaComunicado, { label: string; className: string }> = {
  GERAL:      { label: "Geral",      className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  MANUTENCAO: { label: "Manutenção", className: "bg-blue-50 text-blue-700 border-blue-200" },
  SEGURANCA:  { label: "Segurança",  className: "bg-purple-50 text-purple-700 border-purple-200" },
  FINANCEIRO: { label: "Financeiro", className: "bg-green-50 text-green-700 border-green-200" },
  EVENTOS:    { label: "Eventos",    className: "bg-pink-50 text-pink-700 border-pink-200" },
  URGENTE:    { label: "Urgente",    className: "bg-red-50 text-red-700 border-red-200" },
}

export function CategoriaBadge({ categoria }: { categoria: CategoriaComunicado }) {
  const { label, className } = config[categoria]
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", className)}>
      {label}
    </Badge>
  )
}

export const categoriaLabel: Record<CategoriaComunicado, string> = Object.fromEntries(
  Object.entries(config).map(([k, v]) => [k, v.label])
) as Record<CategoriaComunicado, string>
