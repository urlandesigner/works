import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Wrench, Calendar, Package, Users, MessageSquare } from "lucide-react"

const cards = [
  { title: "Comunicados", icon: Bell, desc: "Avisos e notificações", href: "/comunicados" },
  { title: "Chamados", icon: Wrench, desc: "Manutenção e suporte", href: "/chamados" },
  { title: "Reservas", icon: Calendar, desc: "Áreas comuns", href: "/reservas" },
  { title: "Encomendas", icon: Package, desc: "Controle de entregas", href: "/encomendas" },
  { title: "Visitantes", icon: Users, desc: "Entrada e saída", href: "/visitantes" },
  { title: "Mensagens", icon: MessageSquare, desc: "Síndico e portaria", href: "/mensagens" },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Visão Geral</h2>
        <p className="text-sm text-muted-foreground">Resumo das atividades do condomínio</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, icon: Icon, desc }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
