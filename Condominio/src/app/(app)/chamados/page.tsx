import { ChamadosList } from "@/components/chamados/chamados-list"

export default function ChamadosPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Chamados</h2>
        <p className="text-sm text-muted-foreground">Solicitações de manutenção e suporte</p>
      </div>
      <ChamadosList />
    </div>
  )
}
