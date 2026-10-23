export type CategoriaComunicado = "GERAL" | "MANUTENCAO" | "SEGURANCA" | "FINANCEIRO" | "EVENTOS" | "URGENTE"

export type Comunicado = {
  id: string
  numero: number
  titulo: string
  conteudo: string
  categoria: CategoriaComunicado
  fixado: boolean
  ativo: boolean
  autor: string
  criadoEm: string
}

export type NovoComunicadoInput = {
  titulo: string
  conteudo: string
  categoria: CategoriaComunicado
  fixado: boolean
}

export function adicionarComunicado(input: NovoComunicadoInput): Comunicado {
  const numero = Math.max(...comunicadosMock.map((c) => c.numero)) + 1
  const novo: Comunicado = {
    id: Date.now().toString(),
    numero,
    ativo: true,
    autor: "Administração",
    criadoEm: new Date().toISOString(),
    ...input,
  }
  comunicadosMock.unshift(novo)
  return novo
}

export const comunicadosMock: Comunicado[] = [
  {
    id: "1",
    numero: 1,
    titulo: "Interdição da garagem nos dias 14 e 15 de abril",
    conteudo: `Informamos que a garagem do condomínio estará interditada nos dias 14 (segunda-feira) e 15 (terça-feira) de abril, das 8h às 18h, para realização de obras emergenciais na estrutura do piso.

Durante o período de interdição, os veículos dos moradores deverão ser estacionados na via pública ou em estacionamentos próximos.

Pedimos desculpas pelo transtorno e agradecemos a compreensão de todos. Em caso de dúvidas, entre em contato com a portaria.`,
    categoria: "URGENTE",
    fixado: true,
    ativo: true,
    autor: "Síndico",
    criadoEm: "2025-04-09T08:00:00Z",
  },
  {
    id: "2",
    numero: 2,
    titulo: "Assembleia Geral Ordinária — Maio 2025",
    conteudo: `Convocamos todos os condôminos para a Assembleia Geral Ordinária que será realizada no dia 20 de maio de 2025, às 19h30, no salão de festas do condomínio.

Pauta:
1. Aprovação das contas do exercício 2024
2. Eleição do síndico e conselho fiscal para o biênio 2025–2027
3. Previsão orçamentária para 2025
4. Aprovação de obras de reforma do hall de entrada
5. Assuntos gerais

A presença de todos é fundamental. Condôminos que não puderem comparecer poderão se fazer representar por procuração, conforme modelo disponível na portaria.`,
    categoria: "EVENTOS",
    fixado: true,
    ativo: true,
    autor: "Síndico",
    criadoEm: "2025-04-08T10:00:00Z",
  },
  {
    id: "3",
    numero: 3,
    titulo: "Reajuste da taxa condominial — Maio 2025",
    conteudo: `Comunicamos que, a partir de maio de 2025, a taxa condominial será reajustada em 4,62%, conforme IPCA acumulado dos últimos 12 meses, previsto na convenção do condomínio.

O novo valor da taxa ordinária passará de R$ 680,00 para R$ 711,43 por unidade.

O reajuste foi aprovado em assembleia e é necessário para cobrir o aumento nos custos de manutenção, energia elétrica e serviços terceirizados.

Dúvidas podem ser esclarecidas com a administradora pelo e-mail ou telefone disponíveis na portaria.`,
    categoria: "FINANCEIRO",
    fixado: false,
    ativo: true,
    autor: "Administração",
    criadoEm: "2025-04-07T09:30:00Z",
  },
  {
    id: "4",
    numero: 4,
    titulo: "Limpeza da caixa d'água — 18 de abril",
    conteudo: `Informamos que no dia 18 de abril (sexta-feira), das 8h às 14h, será realizada a limpeza e higienização semestral das caixas d'água do condomínio.

Durante esse período, o fornecimento de água será interrompido em todo o condomínio. Recomendamos que os moradores armazenem água previamente para uso durante o período de manutenção.

A empresa responsável é a AquaClean, devidamente habilitada pela vigilância sanitária. Após a limpeza, a água passará por análise laboratorial antes da liberação para consumo.`,
    categoria: "MANUTENCAO",
    fixado: false,
    ativo: true,
    autor: "Administração",
    criadoEm: "2025-04-06T11:00:00Z",
  },
  {
    id: "5",
    numero: 5,
    titulo: "Novas câmeras de segurança instaladas",
    conteudo: `Informamos que foram instaladas 8 novas câmeras de segurança nas seguintes áreas: hall de entrada, garagem (cobertura total), piscina, salão de festas e corredor do subsolo.

O sistema foi atualizado para gravação em HD com armazenamento em nuvem por 30 dias. O acesso às imagens é restrito ao síndico e, mediante solicitação judicial, às autoridades competentes.

Essa melhoria faz parte do plano de segurança aprovado na última assembleia e representa um investimento de R$ 12.400,00 no condomínio.`,
    categoria: "SEGURANCA",
    fixado: false,
    ativo: true,
    autor: "Síndico",
    criadoEm: "2025-04-04T14:00:00Z",
  },
  {
    id: "6",
    numero: 6,
    titulo: "Manutenção do elevador — 10 de abril",
    conteudo: `Comunicamos que no dia 10 de abril (quinta-feira), das 9h às 12h, o elevador social passará por manutenção preventiva mensal.

Durante esse período, apenas o elevador de serviço estará disponível. Pedimos que os moradores com dificuldade de locomoção entrem em contato com a portaria para auxílio.

A manutenção é realizada pela empresa OTIS, conforme contrato vigente.`,
    categoria: "MANUTENCAO",
    fixado: false,
    ativo: true,
    autor: "Portaria",
    criadoEm: "2025-04-03T16:00:00Z",
  },
  {
    id: "7",
    numero: 7,
    titulo: "Festa junina do condomínio — 28 de junho",
    conteudo: `É com prazer que anunciamos a festa junina do condomínio! O evento será realizado no dia 28 de junho (sábado), às 17h, no espaço gourmet e área externa.

Haverá barracas típicas, música ao vivo, quadrilha e muita animação para toda a família. A participação é gratuita para moradores e seus convidados (máximo 2 convidados por unidade).

Para organização do evento, pedimos que confirmem presença até o dia 20 de junho pelo grupo do WhatsApp do condomínio ou na portaria.

Venha com sua melhor roupa caipira!`,
    categoria: "EVENTOS",
    fixado: false,
    ativo: true,
    autor: "Comissão de Eventos",
    criadoEm: "2025-04-02T10:00:00Z",
  },
  {
    id: "8",
    numero: 8,
    titulo: "Uso correto das áreas de reciclagem",
    conteudo: `Lembramos a todos os moradores sobre o uso correto dos pontos de reciclagem do condomínio, localizados no subsolo ao lado da lixeira principal.

Separação correta:
• Azul: papel e papelão (seco e limpo)
• Vermelho: plástico
• Verde: vidro
• Amarelo: metal
• Preto: lixo orgânico e rejeitos

Itens como eletrônicos, pilhas e lâmpadas não devem ser descartados nas lixeiras comuns. Esses itens possuem pontos de coleta específicos — consulte a portaria para informações.

A colaboração de todos é essencial para mantermos o condomínio organizado e contribuirmos com o meio ambiente.`,
    categoria: "GERAL",
    fixado: false,
    ativo: true,
    autor: "Administração",
    criadoEm: "2025-04-01T09:00:00Z",
  },
]
