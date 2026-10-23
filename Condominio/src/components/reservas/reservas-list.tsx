"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { reservasMock, areasMock, type Reserva, type StatusReserva } from "@/lib/mock/reservas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format, parseISO, isToday, isTomorrow, isPast, isThisWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Search,
  Plus,
  PartyPopper,
  Waves,
  Dumbbell,
  Flame,
  Trophy,
  ChefHat,
  Calendar,
} from "lucide-react"

const areaIcones: Record<string, React.ReactNode> = {
  party:   <PartyPopper className="h-4 w-4" />,
  pool:    <Waves className="h-4 w-4" />,
  gym:     <Dumbbell className="h-4 w-4" />,
  grill:   <Flame className="h-4 w-4" />,
  court:   <Trophy className="h-4 w-4" />,
  gourmet: <ChefHat className="h-4 w-4" />,
}

const iconesPorArea: Record<string, string> = Object.fromEntries(
  areasMock.map((a) => [a.id, a.icone])
)

type StatusFiltro = StatusReserva | "TODAS"

const statusFiltros: { value: StatusFiltro; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "CONFIRMADA", label: "Confirmadas" },
  { value: "CANCELADA", label: "Canceladas" },
]

function formatDiaLabel(dataStr: string): string {
  const data = parseISO(dataStr)
  if (isToday(data)) return "Hoje"
  if (isTomorrow(data)) return "Amanhã"
  if (isThisWeek(data, { weekStartsOn: 0 })) {
    return format(data, "EEEE", { locale: ptBR })
      .replace(/^\w/, (c) => c.toUpperCase())
  }
  return format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })
    .replace(/^\w/, (c) => c.toUpperCase())
}

function agruparPorData(lista: Reserva[]): { data: string; reservas: Reserva[] }[] {
  const mapa = new Map<string, Reserva[]>()
  for (const r of lista) {
    const existing = mapa.get(r.data) ?? []
    existing.push(r)
    mapa.set(r.data, existing)
  }
  return Array.from(mapa.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, reservas]) => ({
      data,
      reservas: reservas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    }))
}

export function ReservasList() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("TODAS")
  const [areaFiltro, setAreaFiltro] = useState("TODAS")

  const contadores = useMemo(() => ({
    TODAS: reservasMock.length,
    CONFIRMADA: reservasMock.filter((r) => r.status === "CONFIRMADA").length,
    CANCELADA: reservasMock.filter((r) => r.status === "CANCELADA").length,
  }), [])

  const grupos = useMemo(() => {
    const filtradas = reservasMock.filter((r) => {
      const matchStatus = statusFiltro === "TODAS" || r.status === statusFiltro
      const matchArea = areaFiltro === "TODAS" || r.areaId === areaFiltro
      const matchBusca =
        busca === "" ||
        r.unidade.toLowerCase().includes(busca.toLowerCase()) ||
        r.nomeRes.toLowerCase().includes(busca.toLowerCase()) ||
        r.areaNome.toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchArea && matchBusca
    })
    return agruparPorData(filtradas)
  }, [busca, statusFiltro, areaFiltro])

  const total = grupos.reduce((acc, g) => acc + g.reservas.length, 0)

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por unidade, responsável..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={areaFiltro} onValueChange={(v) => v && setAreaFiltro(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Área comum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas as áreas</SelectItem>
            {areasMock.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={() => router.push("/reservas/nova")}>
          <Plus className="h-4 w-4" />
          Nova reserva
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

      {/* Lista agrupada por data */}
      {grupos.length === 0 ? (
        <EstadoVazio busca={busca} />
      ) : (
        <div className="space-y-2">
          {grupos.map(({ data, reservas }) => (
            <GrupoData key={data} data={data} reservas={reservas} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {total} reserva{total !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

function GrupoData({ data, reservas }: { data: string; reservas: Reserva[] }) {
  const passado = isPast(parseISO(`${data}T23:59:59`))

  return (
    <div>
      {/* Separador de data */}
      <div className="flex items-center gap-3 py-2">
        <span className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          passado ? "text-muted-foreground/60" : "text-muted-foreground"
        )}>
          {formatDiaLabel(data)}
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className={cn(
          "text-xs tabular-nums",
          passado ? "text-muted-foreground/60" : "text-muted-foreground"
        )}>
          {format(parseISO(data), "dd/MM", { locale: ptBR })}
        </span>
      </div>

      {/* Reservas do dia */}
      <div className="rounded-lg border bg-white divide-y">
        {reservas.map((r) => (
          <ReservaRow key={r.id} reserva={r} passado={passado} />
        ))}
      </div>
    </div>
  )
}

function ReservaRow({ reserva, passado }: { reserva: Reserva; passado: boolean }) {
  const icone = iconesPorArea[reserva.areaId]
  const cancelada = reserva.status === "CANCELADA"
  const esmaecida = passado || cancelada

  return (
    <Link
      href={`/reservas/${reserva.id}`}
      className={cn(
        "flex items-center gap-4 px-4 py-3 transition-colors group",
        cancelada ? "bg-zinc-50/50" : "hover:bg-muted/30"
      )}
    >
      {/* Ícone da área */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
        cancelada
          ? "bg-zinc-100 text-zinc-400"
          : esmaecida
          ? "bg-muted/60 text-muted-foreground/60"
          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      )}>
        {areaIcones[icone] ?? <Calendar className="h-4 w-4" />}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={cn(
              "text-sm font-medium truncate",
              esmaecida && "text-muted-foreground"
            )}>
              {reserva.areaNome}
            </span>
            <span className={cn(
              "text-sm tabular-nums shrink-0",
              esmaecida ? "text-muted-foreground/60" : "text-muted-foreground"
            )}>
              {reserva.horaInicio} – {reserva.horaFim}
            </span>
          </div>
          <StatusBadge status={reserva.status} />
        </div>
        <div className={cn(
          "flex items-center gap-2 mt-0.5 text-xs",
          esmaecida ? "text-muted-foreground/60" : "text-muted-foreground"
        )}>
          <span>Unidade {reserva.unidade}</span>
          <span>·</span>
          <span>{reserva.nomeRes}</span>
        </div>
      </div>
    </Link>
  )
}

function StatusBadge({ status }: { status: StatusReserva }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium shrink-0",
        status === "CONFIRMADA"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-zinc-100 text-zinc-500 border-zinc-200"
      )}
    >
      {status === "CONFIRMADA" ? "Confirmada" : "Cancelada"}
    </Badge>
  )
}

function EstadoVazio({ busca }: { busca: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">Nenhuma reserva encontrada</p>
      <p className="text-xs text-muted-foreground mt-1">
        {busca
          ? `Nenhum resultado para "${busca}"`
          : "Não há reservas para o filtro selecionado."}
      </p>
    </div>
  )
}
