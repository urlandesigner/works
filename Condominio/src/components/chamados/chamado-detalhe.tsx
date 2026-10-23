"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Chamado, StatusChamado } from "@/lib/mock/chamados"
import { type EntradaHistorico } from "@/lib/mock/respostas"
import { StatusBadge, PrioridadeBadge } from "./status-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateTime, formatRelative, cn } from "@/lib/utils"
import {
  ArrowLeft,
  Wrench,
  User,
  Building,
  Clock,
  Tag,
  RefreshCw,
  MessageSquare,
  Send,
  ArrowRight,
} from "lucide-react"

const categoriaLabel: Record<string, string> = {
  ELETRICA: "Elétrica",
  HIDRAULICA: "Hidráulica",
  ESTRUTURA: "Estrutura",
  LIMPEZA: "Limpeza",
  SEGURANCA: "Segurança",
  OUTROS: "Outros",
}

const statusOptions: { value: StatusChamado; label: string }[] = [
  { value: "ABERTO", label: "Aberto" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "AGUARDANDO", label: "Aguardando" },
  { value: "RESOLVIDO", label: "Resolvido" },
  { value: "CANCELADO", label: "Cancelado" },
]

type Props = {
  chamado: Chamado
  historico: EntradaHistorico[]
}

export function ChamadoDetalhe({ chamado, historico: historicoInicial }: Props) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [status, setStatus] = useState<StatusChamado>(chamado.status)
  const [novoStatus, setNovoStatus] = useState<StatusChamado>(chamado.status)
  const [historico, setHistorico] = useState<EntradaHistorico[]>(historicoInicial)
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)

  function handleVoltar() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/chamados")
    }
  }

  function handleEnviarResposta() {
    const textoLimpo = texto.trim()
    if (!textoLimpo) return

    setEnviando(true)

    const novaEntrada: EntradaHistorico = {
      tipo: "resposta",
      id: `r-${Date.now()}`,
      autor: "Administração",
      autorTipo: "ADMINISTRACAO",
      texto: textoLimpo,
      criadoEm: new Date().toISOString(),
    }

    setHistorico((prev) => [...prev, novaEntrada])
    setTexto("")
    setEnviando(false)
    textareaRef.current?.focus()
  }

  function handleAtualizarStatus() {
    if (novoStatus === status) return

    const entrada: EntradaHistorico = {
      tipo: "status",
      id: `s-${Date.now()}`,
      autor: "Administração",
      statusAnterior: status,
      statusNovo: novoStatus,
      criadoEm: new Date().toISOString(),
    }

    setHistorico((prev) => [...prev, entrada])
    setStatus(novoStatus)
  }

  const statusMudou = novoStatus !== status

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Voltar */}
      <button
        onClick={handleVoltar}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para chamados
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Coluna principal ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cabeçalho do chamado */}
          <div className="rounded-lg border bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">#{chamado.numero}</span>
              <span>·</span>
              <span>{categoriaLabel[chamado.categoria]}</span>
            </div>
            <h2 className="text-lg font-semibold leading-snug">{chamado.titulo}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={status} />
              <PrioridadeBadge prioridade={chamado.prioridade} />
            </div>
            <Separator />
            <div className="flex items-start gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {chamado.nomeReq}
              </span>
              <span className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                Unidade {chamado.unidade}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTime(chamado.criadoEm)}
              </span>
            </div>
          </div>

          {/* Descrição */}
          <div className="rounded-lg border bg-white p-5 space-y-2">
            <h3 className="text-sm font-medium">Descrição</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {chamado.descricao}
            </p>
          </div>

          {/* Histórico */}
          <div className="rounded-lg border bg-white p-5 space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Histórico
              {historico.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({historico.length})
                </span>
              )}
            </h3>

            {historico.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma atualização ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {historico.map((entrada) => (
                  <EntradaHistoricoItem key={entrada.id} entrada={entrada} />
                ))}
              </div>
            )}

            <Separator />

            {/* Nova resposta */}
            <div className="space-y-2.5">
              <h4 className="text-sm font-medium">Nova resposta</h4>
              <Textarea
                ref={textareaRef}
                placeholder="Escreva uma resposta ou atualização..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    handleEnviarResposta()
                  }
                }}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ctrl+Enter para enviar</span>
                <Button
                  size="sm"
                  onClick={handleEnviarResposta}
                  disabled={!texto.trim() || enviando}
                  className="gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  Enviar resposta
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Coluna lateral ── */}
        <div className="space-y-4">
          {/* Informações */}
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <h3 className="text-sm font-medium">Informações</h3>
            <div className="space-y-2.5 text-sm">
              <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Categoria">
                {categoriaLabel[chamado.categoria]}
              </InfoRow>
              <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Solicitante">
                {chamado.nomeReq}
              </InfoRow>
              <InfoRow icon={<Building className="h-3.5 w-3.5" />} label="Unidade">
                {chamado.unidade}
              </InfoRow>
              <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Criado">
                <span title={formatDateTime(chamado.criadoEm)}>
                  {formatRelative(chamado.criadoEm)}
                </span>
              </InfoRow>
              <InfoRow icon={<RefreshCw className="h-3.5 w-3.5" />} label="Atualizado">
                <span title={formatDateTime(chamado.atualizadoEm)}>
                  {formatRelative(chamado.atualizadoEm)}
                </span>
              </InfoRow>
            </div>
          </div>

          {/* Atualizar status */}
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <h3 className="text-sm font-medium">Atualizar status</h3>
            <Select
              value={novoStatus}
              onValueChange={(v) => setNovoStatus(v as StatusChamado)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={handleAtualizarStatus}
              disabled={!statusMudou}
              variant={statusMudou ? "default" : "outline"}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {statusMudou ? "Confirmar alteração" : "Status atualizado"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EntradaHistoricoItem({ entrada }: { entrada: EntradaHistorico }) {
  if (entrada.tipo === "status") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-full bg-muted">
          <RefreshCw className="h-3 w-3" />
          <span className="font-medium text-foreground">{entrada.autor}</span>
          <span>alterou o status de</span>
          <StatusLabel status={entrada.statusAnterior} />
          <ArrowRight className="h-3 w-3" />
          <StatusLabel status={entrada.statusNovo} />
          <span>·</span>
          <span>{formatRelative(entrada.criadoEm)}</span>
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>
    )
  }

  const isAdmin = entrada.autorTipo === "ADMINISTRACAO"

  return (
    <div className={cn("flex gap-3", isAdmin && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          isAdmin
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {entrada.autor[0].toUpperCase()}
      </div>
      <div
        className={cn(
          "flex-1 rounded-lg px-3.5 py-2.5 text-sm",
          isAdmin
            ? "bg-primary/5 border border-primary/10"
            : "bg-muted/60 border border-border"
        )}
      >
        <div className={cn("flex items-center gap-2 mb-1", isAdmin && "justify-end")}>
          <span className="text-xs font-medium">{entrada.autor}</span>
          <span className="text-xs text-muted-foreground">{formatRelative(entrada.criadoEm)}</span>
        </div>
        <p className={cn("text-sm leading-relaxed", isAdmin && "text-right")}>
          {entrada.texto}
        </p>
      </div>
    </div>
  )
}

function StatusLabel({ status }: { status: StatusChamado }) {
  const labels: Record<StatusChamado, string> = {
    ABERTO: "Aberto",
    EM_ANDAMENTO: "Em andamento",
    AGUARDANDO: "Aguardando",
    RESOLVIDO: "Resolvido",
    CANCELADO: "Cancelado",
  }
  return <span className="font-medium text-foreground">{labels[status]}</span>
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground shrink-0 pt-0.5 w-24">
        {icon}
        <span className="text-xs">{label}</span>
      </span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}
