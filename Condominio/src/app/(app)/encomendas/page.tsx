import { EncomendasList } from "@/components/encomendas/encomendas-list"

export default function EncomendasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Encomendas</h2>
        <p className="text-sm text-muted-foreground">Controle de recebimento e retirada</p>
      </div>
      <EncomendasList />
    </div>
  )
}
