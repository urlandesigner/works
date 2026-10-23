export type StatusReserva = "CONFIRMADA" | "CANCELADA"

export type AreaComum = {
  id: string
  nome: string
  icone: string
  capacidade: number
}

export type Reserva = {
  id: string
  areaId: string
  areaNome: string
  unidade: string
  nomeRes: string
  data: string        // "YYYY-MM-DD"
  horaInicio: string  // "HH:mm"
  horaFim: string     // "HH:mm"
  status: StatusReserva
  criadoEm: string
}

export type NovaReservaInput = {
  areaId: string
  unidade: string
  nomeRes: string
  data: string
  horaInicio: string
  horaFim: string
}

export function adicionarReserva(input: NovaReservaInput): Reserva {
  const area = areasMock.find((a) => a.id === input.areaId)
  const nova: Reserva = {
    id: Date.now().toString(),
    areaNome: area?.nome ?? "",
    status: "CONFIRMADA",
    criadoEm: new Date().toISOString(),
    ...input,
  }
  reservasMock.push(nova)
  return nova
}

export function cancelarReserva(id: string): void {
  const reserva = reservasMock.find((r) => r.id === id)
  if (reserva) reserva.status = "CANCELADA"
}

export const areasMock: AreaComum[] = [
  { id: "a1", nome: "Salão de Festas",  icone: "party",    capacidade: 80 },
  { id: "a2", nome: "Piscina",          icone: "pool",     capacidade: 30 },
  { id: "a3", nome: "Academia",         icone: "gym",      capacidade: 10 },
  { id: "a4", nome: "Churrasqueira",    icone: "grill",    capacidade: 20 },
  { id: "a5", nome: "Quadra",           icone: "court",    capacidade: 16 },
  { id: "a6", nome: "Espaço Gourmet",   icone: "gourmet",  capacidade: 40 },
]

export const reservasMock: Reserva[] = [
  {
    id: "1",
    areaId: "a3",
    areaNome: "Academia",
    unidade: "502",
    nomeRes: "Lucas Ferreira",
    data: "2025-04-08",
    horaInicio: "06:00",
    horaFim: "07:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-05T10:00:00Z",
  },
  {
    id: "2",
    areaId: "a2",
    areaNome: "Piscina",
    unidade: "301",
    nomeRes: "Carlos Souza",
    data: "2025-04-08",
    horaInicio: "10:00",
    horaFim: "12:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-06T09:00:00Z",
  },
  {
    id: "3",
    areaId: "a1",
    areaNome: "Salão de Festas",
    unidade: "102",
    nomeRes: "Ana Lima",
    data: "2025-04-08",
    horaInicio: "18:00",
    horaFim: "23:00",
    status: "CANCELADA",
    criadoEm: "2025-04-04T14:00:00Z",
  },
  {
    id: "4",
    areaId: "a4",
    areaNome: "Churrasqueira",
    unidade: "205",
    nomeRes: "Roberto Alves",
    data: "2025-04-09",
    horaInicio: "11:00",
    horaFim: "16:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-07T11:00:00Z",
  },
  {
    id: "5",
    areaId: "a5",
    areaNome: "Quadra",
    unidade: "401",
    nomeRes: "Fernanda Costa",
    data: "2025-04-09",
    horaInicio: "08:00",
    horaFim: "10:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-07T08:30:00Z",
  },
  {
    id: "6",
    areaId: "a2",
    areaNome: "Piscina",
    unidade: "304",
    nomeRes: "Juliana Martins",
    data: "2025-04-10",
    horaInicio: "14:00",
    horaFim: "16:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-08T10:00:00Z",
  },
  {
    id: "7",
    areaId: "a6",
    areaNome: "Espaço Gourmet",
    unidade: "101",
    nomeRes: "Marcos Pereira",
    data: "2025-04-12",
    horaInicio: "19:00",
    horaFim: "23:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-08T15:00:00Z",
  },
  {
    id: "8",
    areaId: "a3",
    areaNome: "Academia",
    unidade: "502",
    nomeRes: "Lucas Ferreira",
    data: "2025-04-12",
    horaInicio: "07:00",
    horaFim: "08:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-09T07:00:00Z",
  },
  {
    id: "9",
    areaId: "a1",
    areaNome: "Salão de Festas",
    unidade: "203",
    nomeRes: "Beatriz Santos",
    data: "2025-04-19",
    horaInicio: "15:00",
    horaFim: "22:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-09T09:00:00Z",
  },
  {
    id: "10",
    areaId: "a4",
    areaNome: "Churrasqueira",
    unidade: "302",
    nomeRes: "Diego Rocha",
    data: "2025-04-20",
    horaInicio: "12:00",
    horaFim: "17:00",
    status: "CONFIRMADA",
    criadoEm: "2025-04-09T16:00:00Z",
  },
]
