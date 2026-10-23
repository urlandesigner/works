import { ReservasList } from "@/components/reservas/reservas-list"

export default function ReservasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Reservas</h2>
        <p className="text-sm text-muted-foreground">Agendamentos de áreas comuns</p>
      </div>
      <ReservasList />
    </div>
  )
}
