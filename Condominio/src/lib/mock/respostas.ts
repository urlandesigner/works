import type { StatusChamado } from "./chamados"

export type EntradaHistorico =
  | {
      tipo: "resposta"
      id: string
      autor: string
      autorTipo: "MORADOR" | "ADMINISTRACAO"
      texto: string
      criadoEm: string
    }
  | {
      tipo: "status"
      id: string
      autor: string
      statusAnterior: StatusChamado
      statusNovo: StatusChamado
      criadoEm: string
    }

export const historicoPorChamado: Record<string, EntradaHistorico[]> = {
  "2": [
    {
      tipo: "resposta",
      id: "r1",
      autor: "Portaria",
      autorTipo: "ADMINISTRACAO",
      texto: "Chamado recebido. Vamos acionar o encanador para avaliação ainda hoje.",
      criadoEm: "2025-04-07T09:00:00Z",
    },
    {
      tipo: "status",
      id: "r2",
      autor: "Síndico",
      statusAnterior: "ABERTO",
      statusNovo: "EM_ANDAMENTO",
      criadoEm: "2025-04-09T14:00:00Z",
    },
    {
      tipo: "resposta",
      id: "r3",
      autor: "Síndico",
      autorTipo: "ADMINISTRACAO",
      texto: "O encanador veio fazer a vistoria. O reparo vai ser feito amanhã de manhã entre 8h e 12h.",
      criadoEm: "2025-04-09T14:05:00Z",
    },
  ],
  "3": [
    {
      tipo: "resposta",
      id: "r4",
      autor: "Portaria",
      autorTipo: "ADMINISTRACAO",
      texto: "Constatamos o defeito no portão. Já entramos em contato com a empresa de automação.",
      criadoEm: "2025-04-07T08:00:00Z",
    },
    {
      tipo: "status",
      id: "r5",
      autor: "Portaria",
      statusAnterior: "ABERTO",
      statusNovo: "AGUARDANDO",
      criadoEm: "2025-04-08T09:20:00Z",
    },
  ],
  "4": [
    {
      tipo: "resposta",
      id: "r6",
      autor: "Portaria",
      autorTipo: "ADMINISTRACAO",
      texto: "Empresa de limpeza acionada para hoje à tarde.",
      criadoEm: "2025-04-05T13:00:00Z",
    },
    {
      tipo: "resposta",
      id: "r7",
      autor: "Fernanda Costa",
      autorTipo: "MORADOR",
      texto: "A piscina foi limpa e está ótima agora. Obrigada pela agilidade!",
      criadoEm: "2025-04-07T16:00:00Z",
    },
    {
      tipo: "status",
      id: "r8",
      autor: "Síndico",
      statusAnterior: "EM_ANDAMENTO",
      statusNovo: "RESOLVIDO",
      criadoEm: "2025-04-07T17:30:00Z",
    },
  ],
  "6": [
    {
      tipo: "status",
      id: "r9",
      autor: "Portaria",
      statusAnterior: "ABERTO",
      statusNovo: "EM_ANDAMENTO",
      criadoEm: "2025-04-09T10:15:00Z",
    },
    {
      tipo: "resposta",
      id: "r10",
      autor: "Portaria",
      autorTipo: "ADMINISTRACAO",
      texto: "Eletricista já está a caminho. Enquanto isso, a tomada foi bloqueada com fita isolante por segurança.",
      criadoEm: "2025-04-09T10:20:00Z",
    },
  ],
  "8": [
    {
      tipo: "resposta",
      id: "r11",
      autor: "Síndico",
      autorTipo: "ADMINISTRACAO",
      texto: "Já temos contrato com empresa de dedetização que realiza o serviço mensalmente. A próxima aplicação é na semana que vem.",
      criadoEm: "2025-04-04T14:00:00Z",
    },
    {
      tipo: "status",
      id: "r12",
      autor: "Síndico",
      statusAnterior: "ABERTO",
      statusNovo: "CANCELADO",
      criadoEm: "2025-04-05T11:00:00Z",
    },
    {
      tipo: "resposta",
      id: "r13",
      autor: "Síndico",
      autorTipo: "ADMINISTRACAO",
      texto: "Chamado encerrado pois já está coberto pelo contrato de dedetização vigente.",
      criadoEm: "2025-04-05T11:05:00Z",
    },
  ],
}
