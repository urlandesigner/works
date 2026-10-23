import { ComunicadosList } from "@/components/comunicados/comunicados-list"

export default function ComunicadosPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Comunicados</h2>
        <p className="text-sm text-muted-foreground">Avisos e notificações do condomínio</p>
      </div>
      <ComunicadosList />
    </div>
  )
}
