import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StatusChamado, Prioridade } from "@/lib/mock/chamados"

const statusConfig: Record<StatusChamado, { label: string; className: string }> = {
  ABERTO:       { label: "Aberto",       className: "bg-blue-50 text-blue-700 border-blue-200" },
  EM_ANDAMENTO: { label: "Em andamento", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  AGUARDANDO:   { label: "Aguardando",   className: "bg-orange-50 text-orange-700 border-orange-200" },
  RESOLVIDO:    { label: "Resolvido",    className: "bg-green-50 text-green-700 border-green-200" },
  CANCELADO:    { label: "Cancelado",    className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
}

const prioridadeConfig: Record<Prioridade, { label: string; className: string }> = {
  BAIXA:   { label: "Baixa",   className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  NORMAL:  { label: "Normal",  className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  ALTA:    { label: "Alta",    className: "bg-orange-50 text-orange-700 border-orange-200" },
  URGENTE: { label: "Urgente", className: "bg-red-50 text-red-700 border-red-200" },
}

export function StatusBadge({ status }: { status: StatusChamado }) {
  const { label, className } = statusConfig[status]
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", className)}>
      {label}
    </Badge>
  )
}

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const { label, className } = prioridadeConfig[prioridade]
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", className)}>
      {label}
    </Badge>
  )
}
