"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  encomendasMock,
  confirmarRetirada,
  type Encomenda,
  type StatusEncomenda,
} from "@/lib/mock/encomendas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatRelative, formatDateTime } from "@/lib/utils"
import { Search, Plus, Package, Check, CheckCheck } from "lucide-react"

type StatusFiltro = StatusEncomenda | "TODAS"

const statusFiltros: { value: StatusFiltro; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "AGUARDANDO_RETIRADA", label: "Aguardando retirada" },
  { value: "RETIRADA", label: "Retiradas" },
]

function ordenar(lista: Encomenda[]): Encomenda[] {
  const pendentes = lista
    .filter((e) => e.status === "AGUARDANDO_RETIRADA")
    .sort((a, b) => new Date(a.recebidaEm).getTime() - new Date(b.recebidaEm).getTime())
  const retiradas = lista
    .filter((e) => e.status === "RETIRADA")
    .sort((a, b) => new Date(b.recebidaEm).getTime() - new Date(a.recebidaEm).getTime())
  return [...pendentes, ...retiradas]
}

export function EncomendasList() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("TODAS")
  const [retiradas, setRetiradas] = useState<Set<string>>(new Set())

  const contadores = useMemo(() => {
    const aguardando = encomendasMock.filter(
      (e) => !retiradas.has(e.id) && e.status === "AGUARDANDO_RETIRADA"
    ).length
    const retiradaCount = encomendasMock.filter(
      (e) => retiradas.has(e.id) || e.status === "RETIRADA"
    ).length
    return {
      TODAS: encomendasMock.length,
      AGUARDANDO_RETIRADA: aguardando,
      RETIRADA: retiradaCount,
    }
  }, [retiradas])

  const encomendas = useMemo(() => {
    const filtradas = encomendasMock.filter((e) => {
      const statusEfetivo = retiradas.has(e.id) ? "RETIRADA" : e.status
      const matchStatus = statusFiltro === "TODAS" || statusEfetivo === statusFiltro
      const matchBusca =
        busca === "" ||
        e.unidade.toLowerCase().includes(busca.toLowerCase()) ||
        e.destinatario.toLowerCase().includes(busca.toLowerCase()) ||
        e.remetente.toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchBusca
    })
    return ordenar(filtradas)
  }, [busca, statusFiltro, retiradas])

  function handleRetirada(id: string, e: React.MouseEvent) {
    e.preventDefault()
    confirmarRetirada(id)
    setRetiradas((prev) => new Set([...prev, id]))
  }

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por unidade, destinatário..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-2 ml-auto" onClick={() => router.push("/encomendas/nova")}>
          <Plus className="h-4 w-4" />
          Registrar encomenda
        </Button>
      </div>

      {/* Abas de status */}
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
            <span className={cn(
              "ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
              statusFiltro === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {contadores[value]}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {encomendas.length === 0 ? (
        <EstadoVazio busca={busca} />
      ) : (
        <div className="rounded-lg border bg-white divide-y">
          {encomendas.map((encomenda) => (
            <EncomendaRow
              key={encomenda.id}
              encomenda={encomenda}
              jaRetirada={retiradas.has(encomenda.id)}
              onRetirada={handleRetirada}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {encomendas.length} encomenda{encomendas.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

function EncomendaRow({
  encomenda,
  jaRetirada,
  onRetirada,
}: {
  encomenda: Encomenda
  jaRetirada: boolean
  onRetirada: (id: string, e: React.MouseEvent) => void
}) {
  const retirada = jaRetirada || encomenda.status === "RETIRADA"

  return (
    <Link
      href={`/encomendas/${encomenda.id}`}
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 transition-colors group",
        retirada ? "bg-zinc-50/50 hover:bg-zinc-50" : "hover:bg-muted/30"
      )}
    >
      {/* Ícone */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
        retirada
          ? "bg-zinc-100 text-zinc-400"
          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      )}>
        <Package className="h-4 w-4" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium",
                retirada && "text-muted-foreground"
              )}>
                Unidade {encomenda.unidade}
              </span>
              <span className={cn(
                "text-sm",
                retirada ? "text-muted-foreground/70" : "text-foreground"
              )}>
                · {encomenda.destinatario}
              </span>
            </div>
            <div className={cn(
              "flex items-center gap-2 mt-0.5 text-xs",
              retirada ? "text-muted-foreground/60" : "text-muted-foreground"
            )}>
              <span>{encomenda.remetente}</span>
              <span>·</span>
              <span>{encomenda.descricao}</span>
              <span>·</span>
              <span>Recebido {formatRelative(encomenda.recebidaEm)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {retirada ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCheck className="h-3.5 w-3.5 text-green-600" />
                {encomenda.retiradaEm
                  ? <span title={formatDateTime(encomenda.retiradaEm)}>Retirada {formatRelative(encomenda.retiradaEm)}</span>
                  : "Retirada"
                }
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs gap-1.5 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                onClick={(e) => onRetirada(encomenda.id, e)}
              >
                <Check className="h-3.5 w-3.5" />
                Confirmar retirada
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function EstadoVazio({ busca }: { busca: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Package className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">Nenhuma encomenda encontrada</p>
      <p className="text-xs text-muted-foreground mt-1">
        {busca
          ? `Nenhum resultado para "${busca}"`
          : "Não há encomendas para o filtro selecionado."}
      </p>
    </div>
  )
}
