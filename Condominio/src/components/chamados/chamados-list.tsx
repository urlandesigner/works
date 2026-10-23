"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { chamadosMock, type Chamado, type StatusChamado, type Prioridade } from "@/lib/mock/chamados"
import { StatusBadge, PrioridadeBadge } from "./status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatRelative } from "@/lib/utils"
import { Search, Wrench, MessageSquare, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const categoriaLabel: Record<string, string> = {
  ELETRICA: "Elétrica",
  HIDRAULICA: "Hidráulica",
  ESTRUTURA: "Estrutura",
  LIMPEZA: "Limpeza",
  SEGURANCA: "Segurança",
  OUTROS: "Outros",
}

const statusFiltros: { value: StatusChamado | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "ABERTO", label: "Abertos" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "AGUARDANDO", label: "Aguardando" },
  { value: "RESOLVIDO", label: "Resolvidos" },
  { value: "CANCELADO", label: "Cancelados" },
]

export function ChamadosList() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<StatusChamado | "TODOS">("TODOS")
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<Prioridade | "TODAS">("TODAS")

  const chamados = useMemo(() => {
    return chamadosMock.filter((c) => {
      const matchStatus = statusFiltro === "TODOS" || c.status === statusFiltro
      const matchPrioridade = prioridadeFiltro === "TODAS" || c.prioridade === prioridadeFiltro
      const matchBusca =
        busca === "" ||
        c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        c.unidade.toLowerCase().includes(busca.toLowerCase()) ||
        c.nomeReq.toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchPrioridade && matchBusca
    })
  }, [busca, statusFiltro, prioridadeFiltro])

  const contadores = useMemo(() => {
    return {
      TODOS: chamadosMock.length,
      ABERTO: chamadosMock.filter((c) => c.status === "ABERTO").length,
      EM_ANDAMENTO: chamadosMock.filter((c) => c.status === "EM_ANDAMENTO").length,
      AGUARDANDO: chamadosMock.filter((c) => c.status === "AGUARDANDO").length,
      RESOLVIDO: chamadosMock.filter((c) => c.status === "RESOLVIDO").length,
      CANCELADO: chamadosMock.filter((c) => c.status === "CANCELADO").length,
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, unidade..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={prioridadeFiltro}
            onValueChange={(v) => setPrioridadeFiltro(v as Prioridade | "TODAS")}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas</SelectItem>
              <SelectItem value="URGENTE">Urgente</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="BAIXA">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-2" onClick={() => router.push("/chamados/novo")}>
            <Plus className="h-4 w-4" />
            Novo chamado
          </Button>
        </div>
      </div>

      {/* Filtros de status */}
      <div className="flex gap-1 border-b">
        {statusFiltros.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFiltro(value)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              statusFiltro === value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                statusFiltro === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {contadores[value]}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {chamados.length === 0 ? (
        <EstadoVazio busca={busca} />
      ) : (
        <div className="rounded-lg border bg-white divide-y">
          {chamados.map((chamado) => (
            <ChamadoRow key={chamado.id} chamado={chamado} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {chamados.length} chamado{chamados.length !== 1 ? "s" : ""} encontrado{chamados.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

function ChamadoRow({ chamado }: { chamado: Chamado }) {
  return (
    <Link
      href={`/chamados/${chamado.id}`}
      className="flex items-start gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors group"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted mt-0.5 group-hover:bg-primary/10 transition-colors">
        <Wrench className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono">#{chamado.numero}</span>
              <span className="text-sm font-medium truncate">{chamado.titulo}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{chamado.descricao}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PrioridadeBadge prioridade={chamado.prioridade} />
            <StatusBadge status={chamado.status} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span>Unidade {chamado.unidade}</span>
          <span>·</span>
          <span>{chamado.nomeReq}</span>
          <span>·</span>
          <span>{categoriaLabel[chamado.categoria]}</span>
          {chamado.respostas > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {chamado.respostas}
              </span>
            </>
          )}
          <span>·</span>
          <span>{formatRelative(chamado.criadoEm)}</span>
        </div>
      </div>
    </Link>
  )
}

function EstadoVazio({ busca }: { busca: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Wrench className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">Nenhum chamado encontrado</p>
      <p className="text-xs text-muted-foreground mt-1">
        {busca
          ? `Nenhum resultado para "${busca}"`
          : "Não há chamados para o filtro selecionado."}
      </p>
    </div>
  )
}
