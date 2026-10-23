import { notFound } from "next/navigation"
import { reservasMock, areasMock } from "@/lib/mock/reservas"
import { ReservaDetalhe } from "@/components/reservas/reserva-detalhe"

type Props = { params: Promise<{ id: string }> }

export default async function ReservaDetalhePage({ params }: Props) {
  const { id } = await params
  const reserva = reservasMock.find((r) => r.id === id)
  if (!reserva) notFound()
  return <ReservaDetalhe reserva={reserva} areas={areasMock} />
}

export function generateStaticParams() {
  return reservasMock.map((r) => ({ id: r.id }))
}
