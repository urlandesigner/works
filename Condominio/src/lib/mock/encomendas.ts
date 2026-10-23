export type StatusEncomenda = "AGUARDANDO_RETIRADA" | "RETIRADA"

export type Encomenda = {
  id: string
  unidade: string
  destinatario: string
  remetente: string
  descricao: string
  observacoes: string | null
  status: StatusEncomenda
  recebidaEm: string
  retiradaEm: string | null
}

export type NovaEncomendaInput = {
  unidade: string
  destinatario: string
  remetente: string
  descricao: string
  observacoes: string | null
  recebidaEm: string
}

export function adicionarEncomenda(input: NovaEncomendaInput): Encomenda {
  const nova: Encomenda = {
    id: Date.now().toString(),
    status: "AGUARDANDO_RETIRADA",
    retiradaEm: null,
    ...input,
  }
  encomendasMock.unshift(nova)
  return nova
}

export function confirmarRetirada(id: string): void {
  const encomenda = encomendasMock.find((e) => e.id === id)
  if (encomenda) {
    encomenda.status = "RETIRADA"
    encomenda.retiradaEm = new Date().toISOString()
  }
}

export const encomendasMock: Encomenda[] = [
  {
    id: "1",
    unidade: "301",
    destinatario: "Carlos Souza",
    remetente: "Amazon",
    descricao: "Caixa média",
    status: "AGUARDANDO_RETIRADA",
    recebidaEm: "2025-04-09T08:30:00Z",
    observacoes: null,
    retiradaEm: null,
  },
  {
    id: "2",
    unidade: "102",
    destinatario: "Ana Lima",
    remetente: "Mercado Livre",
    descricao: "Envelope grande",
    status: "AGUARDANDO_RETIRADA",
    recebidaEm: "2025-04-09T10:15:00Z",
    observacoes: null,
    retiradaEm: null,
  },
  {
    id: "3",
    unidade: "502",
    destinatario: "Lucas Ferreira",
    remetente: "Correios",
    descricao: "Caixa pequena",
    status: "AGUARDANDO_RETIRADA",
    recebidaEm: "2025-04-09T11:40:00Z",
    observacoes: null,
    retiradaEm: null,
  },
  {
    id: "4",
    unidade: "205",
    destinatario: "Roberto Alves",
    remetente: "Shopee",
    descricao: "Sacola plástica",
    status: "AGUARDANDO_RETIRADA",
    recebidaEm: "2025-04-08T14:00:00Z",
    observacoes: null,
    retiradaEm: null,
  },
  {
    id: "5",
    unidade: "401",
    destinatario: "Fernanda Costa",
    remetente: "iFood",
    descricao: "Sacola de alimentos",
    status: "RETIRADA",
    recebidaEm: "2025-04-08T19:30:00Z",
    observacoes: null,
    retiradaEm: "2025-04-08T20:05:00Z",
  },
  {
    id: "6",
    unidade: "304",
    destinatario: "Juliana Martins",
    remetente: "Amazon",
    descricao: "Caixa grande",
    status: "RETIRADA",
    recebidaEm: "2025-04-07T09:00:00Z",
    observacoes: null,
    retiradaEm: "2025-04-07T18:30:00Z",
  },
  {
    id: "7",
    unidade: "101",
    destinatario: "Marcos Pereira",
    remetente: "Correios",
    descricao: "Envelope registrado",
    status: "RETIRADA",
    recebidaEm: "2025-04-07T11:20:00Z",
    observacoes: null,
    retiradaEm: "2025-04-08T08:45:00Z",
  },
  {
    id: "8",
    unidade: "203",
    destinatario: "Beatriz Santos",
    remetente: "Mercado Livre",
    descricao: "Caixa média",
    status: "AGUARDANDO_RETIRADA",
    recebidaEm: "2025-04-07T16:10:00Z",
    observacoes: null,
    retiradaEm: null,
  },
  {
    id: "9",
    unidade: "502",
    destinatario: "Lucas Ferreira",
    remetente: "Shopee",
    descricao: "Pacote pequeno",
    status: "RETIRADA",
    recebidaEm: "2025-04-06T10:00:00Z",
    observacoes: null,
    retiradaEm: "2025-04-06T19:00:00Z",
  },
  {
    id: "10",
    unidade: "302",
    destinatario: "Diego Rocha",
    remetente: "Correios",
    descricao: "Caixa pequena",
    status: "AGUARDANDO_RETIRADA",
    recebidaEm: "2025-04-06T13:30:00Z",
    observacoes: null,
    retiradaEm: null,
  },
]
