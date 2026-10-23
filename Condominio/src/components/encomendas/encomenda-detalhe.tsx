"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { confirmarRetirada, type Encomenda } from "@/lib/mock/encomendas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn, formatDateTime } from "@/lib/utils"
import {
  ArrowLeft,
  Package,
  Check,
  CheckCheck,
  Clock,
  Tag,
  Truck,
} from "lucide-react"

type Props = { encomenda: Encomenda }

export function EncomendaDetalhe({ encomenda: initial }: Props) {
  const router = useRouter()
  const [encomenda, setEncomenda] = useState(initial)

  const retirada = encomenda.status === "RETIRADA"

  function handleVoltar() {
    if (window.history.length > 1) router.back()
    else router.push("/encomendas")
  }

  function handleConfirmarRetirada() {
    confirmarRetirada(encomenda.id)
    setEncomenda((prev) => ({
      ...prev,
      status: "RETIRADA",
      retiradaEm: new Date().toISOString(),
    }))
  }

  return (
    <div className="space-y-6 max-w-xl">
      <button
        onClick={handleVoltar}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para encomendas
      </button>

      <div className="rounded-lg border bg-white p-6 space-y-5">
        {/* Cabeçalho */}
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
            retirada ? "bg-zinc-100 text-zinc-400" : "bg-primary/10 text-primary"
          )}>
            <Package className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={cn("text-base font-semibold", retirada && "text-muted-foreground")}>
                Unidade {encomenda.unidade} · {encomenda.destinatario}
              </h2>
            </div>
            <div className="mt-1">
              <StatusBadge status={encomenda.status} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Informações */}
        <div className="space-y-3">
          <InfoRow icon={<Truck className="h-4 w-4" />} label="Remetente">
            {encomenda.remetente}
          </InfoRow>
          <InfoRow icon={<Tag className="h-4 w-4" />} label="Descrição">
            {encomenda.descricao}
          </InfoRow>
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Recebida em">
            {formatDateTime(encomenda.recebidaEm)}
          </InfoRow>
          {retirada && encomenda.retiradaEm && (
            <InfoRow icon={<CheckCheck className="h-4 w-4" />} label="Retirada em">
              <span className="text-green-700 font-medium">
                {formatDateTime(encomenda.retiradaEm)}
              </span>
            </InfoRow>
          )}
          {encomenda.observacoes && (
            <InfoRow icon={<Tag className="h-4 w-4" />} label="Observações">
              {encomenda.observacoes}
            </InfoRow>
          )}
        </div>

        <Separator />

        {/* Linha do tempo */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Linha do tempo</h3>
          <div className="relative pl-5 space-y-0">
            {/* Linha vertical conectando os pontos */}
            <div className={cn(
              "absolute left-[7px] top-2 w-px",
              retirada ? "bottom-2 bg-green-300" : "bottom-2 bg-border"
            )} />

            {/* Evento: recebida */}
            <TimelineItem
              done
              label="Encomenda recebida na portaria"
              timestamp={formatDateTime(encomenda.recebidaEm)}
            />

            {/* Evento: retirada ou pendente */}
            {retirada && encomenda.retiradaEm ? (
              <TimelineItem
                done
                label="Retirada pelo morador"
                timestamp={formatDateTime(encomenda.retiradaEm)}
                green
              />
            ) : (
              <TimelineItem
                done={false}
                label="Aguardando retirada do morador"
              />
            )}
          </div>
        </div>

        {/* Ação */}
        {!retirada && (
          <>
            <Separator />
            <Button
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmarRetirada}
            >
              <Check className="h-4 w-4" />
              Confirmar retirada
            </Button>
          </>
        )}

        {retirada && (
          <div className="flex items-center justify-center gap-2 py-1 text-sm text-green-700">
            <CheckCheck className="h-4 w-4" />
            <span className="font-medium">Encomenda retirada</span>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Encomenda["status"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        status === "AGUARDANDO_RETIRADA"
          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
          : "bg-green-50 text-green-700 border-green-200"
      )}
    >
      {status === "AGUARDANDO_RETIRADA" ? "Aguardando retirada" : "Retirada"}
    </Badge>
  )
}

function TimelineItem({
  done,
  label,
  timestamp,
  green,
}: {
  done: boolean
  label: string
  timestamp?: string
  green?: boolean
}) {
  return (
    <div className="relative flex items-start gap-3 pb-4 last:pb-0">
      {/* Ponto */}
      <div className={cn(
        "absolute -left-5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 bg-white mt-0.5",
        done && green
          ? "border-green-500"
          : done
          ? "border-primary"
          : "border-muted-foreground/30"
      )}>
        {done && (
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            green ? "bg-green-500" : "bg-primary"
          )} />
        )}
      </div>

      {/* Conteúdo */}
      <div className="min-w-0">
        <p className={cn(
          "text-sm",
          done ? "text-foreground" : "text-muted-foreground"
        )}>
          {label}
        </p>
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-0.5">{timestamp}</p>
        )}
      </div>
    </div>
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
