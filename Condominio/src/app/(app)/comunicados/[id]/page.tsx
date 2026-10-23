import { notFound } from "next/navigation"
import Link from "next/link"
import { comunicadosMock } from "@/lib/mock/comunicados"
import { CategoriaBadge } from "@/components/comunicados/categoria-badge"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"
import { ArrowLeft, Pin, User, Clock } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ComunicadoDetalhePage({ params }: Props) {
  const { id } = await params
  const comunicado = comunicadosMock.find((c) => c.id === id)

  if (!comunicado) notFound()

  const paragrafos = comunicado.conteudo.split("\n").filter(Boolean)

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/comunicados"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para comunicados
      </Link>

      <article className="rounded-lg border bg-white p-6 space-y-5">
        {/* Badges de destaque */}
        {(comunicado.categoria === "URGENTE" || comunicado.fixado) && (
          <div className="flex items-center gap-2">
            {comunicado.categoria === "URGENTE" && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium text-xs">
                Urgente
              </Badge>
            )}
            {comunicado.fixado && (
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                <Pin className="h-3 w-3 fill-primary" />
                Fixado
              </span>
            )}
          </div>
        )}

        {/* Título */}
        <div className="space-y-3">
          <h1 className="text-xl font-semibold leading-snug">{comunicado.titulo}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <CategoriaBadge categoria={comunicado.categoria} />
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {comunicado.autor}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDateTime(comunicado.criadoEm)}
            </span>
          </div>
        </div>

        <div className="border-t" />

        {/* Conteúdo */}
        <div className="space-y-3">
          {paragrafos.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
      </article>
    </div>
  )
}

export function generateStaticParams() {
  return comunicadosMock.map((c) => ({ id: c.id }))
}
