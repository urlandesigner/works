import { notFound } from "next/navigation"
import { encomendasMock } from "@/lib/mock/encomendas"
import { EncomendaDetalhe } from "@/components/encomendas/encomenda-detalhe"

type Props = { params: Promise<{ id: string }> }

export default async function EncomendaDetalhePage({ params }: Props) {
  const { id } = await params
  const encomenda = encomendasMock.find((e) => e.id === id)
  if (!encomenda) notFound()
  return <EncomendaDetalhe encomenda={encomenda} />
}

export function generateStaticParams() {
  return encomendasMock.map((e) => ({ id: e.id }))
}
