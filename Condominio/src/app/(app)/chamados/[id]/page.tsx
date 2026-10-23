import { notFound } from "next/navigation"
import { chamadosMock } from "@/lib/mock/chamados"
import { historicoPorChamado } from "@/lib/mock/respostas"
import { ChamadoDetalhe } from "@/components/chamados/chamado-detalhe"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ChamadoDetalhePage({ params }: Props) {
  const { id } = await params
  const chamado = chamadosMock.find((c) => c.id === id)

  if (!chamado) notFound()

  const historico = historicoPorChamado[id] ?? []

  return <ChamadoDetalhe chamado={chamado} historico={historico} />
}

export function generateStaticParams() {
  return chamadosMock.map((c) => ({ id: c.id }))
}
