"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { comunicadosMock, type Comunicado, type CategoriaComunicado } from "@/lib/mock/comunicados"
import { CategoriaBadge } from "./categoria-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatRelative } from "@/lib/utils"
import { Search, Bell, Pin, Plus, AlertTriangle } from "lucide-react"

type Aba = CategoriaComunicado | "TODOS" | "FIXADOS"

const abas: { value: Aba; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "FIXADOS", label: "Fixados" },
  { value: "GERAL", label: "Geral" },
  { value: "MANUTENCAO", label: "Manutenção" },
  { value: "SEGURANCA", label: "Segurança" },
  { value: "FINANCEIRO", label: "Financeiro" },
  { value: "EVENTOS", label: "Eventos" },
  { value: "URGENTE", label: "Urgente" },
]

function ordenar(lista: Comunicado[]): Comunicado[] {
  return [...lista].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1
    if (!a.fixado && b.fixado) return 1
    return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  })
}

export function ComunicadosList() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [aba, setAba] = useState<Aba>("TODOS")

  const contadores = useMemo(() => ({
    TODOS: comunicadosMock.length,
    FIXADOS: comunicadosMock.filter((c) => c.fixado).length,
    GERAL: comunicadosMock.filter((c) => c.categoria === "GERAL").length,
    MANUTENCAO: comunicadosMock.filter((c) => c.categoria === "MANUTENCAO").length,
    SEGURANCA: comunicadosMock.filter((c) => c.categoria === "SEGURANCA").length,
    FINANCEIRO: comunicadosMock.filter((c) => c.categoria === "FINANCEIRO").length,
    EVENTOS: comunicadosMock.filter((c) => c.categoria === "EVENTOS").length,
    URGENTE: comunicadosMock.filter((c) => c.categoria === "URGENTE").length,
  }), [])

  const comunicados = useMemo(() => {
    const filtrados = comunicadosMock.filter((c) => {
      const matchAba =
        aba === "TODOS" ||
        (aba === "FIXADOS" ? c.fixado : c.categoria === aba)
      const matchBusca =
        busca === "" ||
        c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        c.conteudo.toLowerCase().includes(busca.toLowerCase())
      return matchAba && matchBusca
    })
    return ordenar(filtrados)
  }, [aba, busca])

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comunicados..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-2" onClick={() => router.push("/comunicados/novo")}>
          <Plus className="h-4 w-4" />
          Novo comunicado
        </Button>
      </div>

      {/* Abas de filtro */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {abas.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setAba(value)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              aba === value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {contadores[value] > 0 && (
              <span className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                aba === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {contadores[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {comunicados.length === 0 ? (
        <EstadoVazio busca={busca} />
      ) : (
        <div className="rounded-lg border bg-white divide-y">
          {comunicados.map((c) => (
            <ComunicadoRow key={c.id} comunicado={c} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {comunicados.length} comunicado{comunicados.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

function ComunicadoRow({ comunicado }: { comunicado: Comunicado }) {
  const isUrgente = comunicado.categoria === "URGENTE"

  return (
    <Link
      href={`/comunicados/${comunicado.id}`}
      className={cn(
        "flex items-start gap-4 px-4 py-3.5 transition-colors group",
        isUrgente
          ? "bg-red-50/50 hover:bg-red-50"
          : "hover:bg-muted/30"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md mt-0.5 transition-colors",
        isUrgente
          ? "bg-red-100 group-hover:bg-red-200"
          : "bg-muted group-hover:bg-primary/10"
      )}>
        {isUrgente
          ? <AlertTriangle className="h-4 w-4 text-red-600" />
          : <Bell className={cn("h-4 w-4", comunicado.fixado ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors")} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex items-start gap-2">
            {comunicado.fixado && (
              <Pin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            )}
            <span className={cn(
              "text-sm font-medium leading-snug",
              isUrgente && "text-red-900"
            )}>
              {comunicado.titulo}
            </span>
          </div>
          <CategoriaBadge categoria={comunicado.categoria} />
        </div>

        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {comunicado.conteudo.split("\n")[0]}
        </p>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <span>{comunicado.autor}</span>
          <span>·</span>
          <span>{formatRelative(comunicado.criadoEm)}</span>
        </div>
      </div>
    </Link>
  )
}

function EstadoVazio({ busca }: { busca: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Bell className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">Nenhum comunicado encontrado</p>
      <p className="text-xs text-muted-foreground mt-1">
        {busca
          ? `Nenhum resultado para "${busca}"`
          : "Não há comunicados para o filtro selecionado."}
      </p>
    </div>
  )
}
