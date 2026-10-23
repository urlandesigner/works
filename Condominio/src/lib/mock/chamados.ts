export type StatusChamado = "ABERTO" | "EM_ANDAMENTO" | "AGUARDANDO" | "RESOLVIDO" | "CANCELADO"
export type Prioridade = "BAIXA" | "NORMAL" | "ALTA" | "URGENTE"
export type CategoriaChamado = "ELETRICA" | "HIDRAULICA" | "ESTRUTURA" | "LIMPEZA" | "SEGURANCA" | "OUTROS"

export type Chamado = {
  id: string
  numero: number
  titulo: string
  descricao: string
  categoria: CategoriaChamado
  status: StatusChamado
  prioridade: Prioridade
  unidade: string
  nomeReq: string
  criadoEm: string
  atualizadoEm: string
  respostas: number
}

export type NovoChamadoInput = {
  titulo: string
  descricao: string
  categoria: CategoriaChamado
  prioridade: Prioridade
  unidade: string
  nomeReq: string
}

export function adicionarChamado(input: NovoChamadoInput): Chamado {
  const numero = Math.max(...chamadosMock.map((c) => c.numero)) + 1
  const agora = new Date().toISOString()
  const novo: Chamado = {
    id: Date.now().toString(),
    numero,
    status: "ABERTO",
    respostas: 0,
    criadoEm: agora,
    atualizadoEm: agora,
    ...input,
  }
  chamadosMock.push(novo)
  return novo
}

export const chamadosMock: Chamado[] = [
  {
    id: "1",
    numero: 1,
    titulo: "Lâmpada queimada no corredor do 3º andar",
    descricao: "A lâmpada do corredor próximo ao elevador está queimada há 3 dias.",
    categoria: "ELETRICA",
    status: "ABERTO",
    prioridade: "NORMAL",
    unidade: "301",
    nomeReq: "Carlos Souza",
    criadoEm: "2025-04-08T10:30:00Z",
    atualizadoEm: "2025-04-08T10:30:00Z",
    respostas: 0,
  },
  {
    id: "2",
    numero: 2,
    titulo: "Vazamento na tubulação da garagem",
    descricao: "Há um vazamento visível na tubulação próxima à vaga 12. A água está escorrendo pelo piso.",
    categoria: "HIDRAULICA",
    status: "EM_ANDAMENTO",
    prioridade: "ALTA",
    unidade: "102",
    nomeReq: "Ana Lima",
    criadoEm: "2025-04-07T08:15:00Z",
    atualizadoEm: "2025-04-09T14:00:00Z",
    respostas: 2,
  },
  {
    id: "3",
    numero: 3,
    titulo: "Portão da garagem com defeito",
    descricao: "O portão automático da garagem não está fechando completamente.",
    categoria: "SEGURANCA",
    status: "AGUARDANDO",
    prioridade: "ALTA",
    unidade: "205",
    nomeReq: "Roberto Alves",
    criadoEm: "2025-04-06T16:45:00Z",
    atualizadoEm: "2025-04-08T09:20:00Z",
    respostas: 1,
  },
  {
    id: "4",
    numero: 4,
    titulo: "Limpeza da piscina pendente",
    descricao: "A piscina está com a água turva há dois dias. Solicito limpeza urgente.",
    categoria: "LIMPEZA",
    status: "RESOLVIDO",
    prioridade: "NORMAL",
    unidade: "401",
    nomeReq: "Fernanda Costa",
    criadoEm: "2025-04-05T11:00:00Z",
    atualizadoEm: "2025-04-07T17:30:00Z",
    respostas: 3,
  },
  {
    id: "5",
    numero: 5,
    titulo: "Rachadura na parede da escada",
    descricao: "Identificei uma rachadura na parede da escada entre o 1º e 2º andar.",
    categoria: "ESTRUTURA",
    status: "ABERTO",
    prioridade: "URGENTE",
    unidade: "101",
    nomeReq: "Marcos Pereira",
    criadoEm: "2025-04-09T07:00:00Z",
    atualizadoEm: "2025-04-09T07:00:00Z",
    respostas: 0,
  },
  {
    id: "6",
    numero: 6,
    titulo: "Tomada com faísca no hall de entrada",
    descricao: "A tomada próxima ao painel de interfones está com faísca ao usar.",
    categoria: "ELETRICA",
    status: "EM_ANDAMENTO",
    prioridade: "URGENTE",
    unidade: "Área Comum",
    nomeReq: "Portaria",
    criadoEm: "2025-04-09T09:30:00Z",
    atualizadoEm: "2025-04-09T10:15:00Z",
    respostas: 1,
  },
  {
    id: "7",
    numero: 7,
    titulo: "Barulho no encanamento do banheiro",
    descricao: "Há um barulho de batida nos canos do banheiro toda vez que a água é ligada.",
    categoria: "HIDRAULICA",
    status: "ABERTO",
    prioridade: "BAIXA",
    unidade: "304",
    nomeReq: "Juliana Martins",
    criadoEm: "2025-04-04T15:20:00Z",
    atualizadoEm: "2025-04-04T15:20:00Z",
    respostas: 0,
  },
  {
    id: "8",
    numero: 8,
    titulo: "Solicitação de dedetização",
    descricao: "Avistei baratas na área da lixeira. Solicito dedetização preventiva.",
    categoria: "LIMPEZA",
    status: "CANCELADO",
    prioridade: "NORMAL",
    unidade: "502",
    nomeReq: "Paulo Rodrigues",
    criadoEm: "2025-04-03T13:10:00Z",
    atualizadoEm: "2025-04-05T11:00:00Z",
    respostas: 2,
  },
]
