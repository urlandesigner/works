"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cancelarReserva, type Reserva, type AreaComum } from "@/lib/mock/reservas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatDateTime, cn } from "@/lib/utils"
import { parse, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft,
  PartyPopper,
  Waves,
  Dumbbell,
  Flame,
  Trophy,
  ChefHat,
  Calendar,
  Clock,
  Building,
  User,
  AlertTriangle,
} from "lucide-react"

const areaIcones: Record<string, React.ReactNode> = {
  party:   <PartyPopper className="h-5 w-5" />,
  pool:    <Waves className="h-5 w-5" />,
  gym:     <Dumbbell className="h-5 w-5" />,
  grill:   <Flame className="h-5 w-5" />,
  court:   <Trophy className="h-5 w-5" />,
  gourmet: <ChefHat className="h-5 w-5" />,
}

function formatDiaSemana(dataStr: string) {
  const data = parse(dataStr, "yyyy-MM-dd", new Date())
  return format(data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    .replace(/^\w/, (c) => c.toUpperCase())
}

type Props = { reserva: Reserva; areas: AreaComum[] }

export function ReservaDetalhe({ reserva: initial, areas }: Props) {
  const router = useRouter()
  const [reserva, setReserva] = useState(initial)
  const [confirmando, setConfirmando] = useState(false)

  const area = areas.find((a) => a.id === reserva.areaId)
  const icone = area ? areaIcones[area.icone] : <Calendar className="h-5 w-5" />
  const confirmada = reserva.status === "CONFIRMADA"

  function handleVoltar() {
    if (window.history.length > 1) router.back()
    else router.push("/reservas")
  }

  function handleCancelar() {
    cancelarReserva(reserva.id)
    setReserva((prev) => ({ ...prev, status: "CANCELADA" }))
    setConfirmando(false)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <button
        onClick={handleVoltar}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para reservas
      </button>

      <div className="rounded-lg border bg-white p-6 space-y-5">
        {/* Cabeçalho */}
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            confirmada ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400"
          )}>
            {icone}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={cn(
                "text-lg font-semibold",
                !confirmada && "text-muted-foreground"
              )}>
                {reserva.areaNome}
              </h2>
              <StatusBadge status={reserva.status} />
            </div>
            {area && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Capacidade: {area.capacidade} pessoas
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Informações */}
        <div className="space-y-3">
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Data">
            <span className="capitalize">{formatDiaSemana(reserva.data)}</span>
          </InfoRow>
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Horário">
            {reserva.horaInicio} – {reserva.horaFim}
          </InfoRow>
          <InfoRow icon={<Building className="h-4 w-4" />} label="Unidade">
            {reserva.unidade}
          </InfoRow>
          <InfoRow icon={<User className="h-4 w-4" />} label="Responsável">
            {reserva.nomeRes}
          </InfoRow>
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Criado em">
            {formatDateTime(reserva.criadoEm)}
          </InfoRow>
        </div>

        {/* Ação de cancelamento */}
        {confirmada && (
          <>
            <Separator />
            {confirmando ? (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmando(false)}
                    className="flex-1"
                  >
                    Manter reserva
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleCancelar}
                    className="flex-1"
                  >
                    Cancelar reserva
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/30"
                onClick={() => setConfirmando(true)}
              >
                Cancelar reserva
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: "CONFIRMADA" | "CANCELADA" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        status === "CONFIRMADA"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-zinc-100 text-zinc-500 border-zinc-200"
      )}
    >
      {status === "CONFIRMADA" ? "Confirmada" : "Cancelada"}
    </Badge>
  )
}

function InfoRow({ icon, label, children }: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground shrink-0 pt-0.5 w-28">
        {icon}
        <span className="text-xs">{label}</span>
      </span>
      <span className="text-sm">{children}</span>
    </div>
  )
}
