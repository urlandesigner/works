export type Message = {
  id: string;
  title: string;
  body: string;
  closing: string;
  /** Opcional — usado no histórico local; padrão na gravação: "mensagem". */
  category?: string;
};

/** Texto fixo abaixo do corpo da mensagem (reforço emocional). */
export const MESSAGE_REINFORCEMENT =
  "Essa mensagem foi escolhida para você agora." as const;

export const MESSAGE_KEEP_PROMPT =
  "💛 Às vezes, é só isso que a gente precisava." as const;

export const MESSAGE_CONTINUITY_LINE =
  "💛 Obrigado por fazer parte disso." as const;

/** URL oficial do site — fonte de verdade para links de compartilhamento. */
export const OFFICIAL_SITE_URL = "https://www.mensageirodobem.com.br/" as const;

/** Convite (com link oficial) anexado ao texto compartilhado. */
export const SHARE_INVITE_LINE =
  `💛 Receba a sua em ${OFFICIAL_SITE_URL}` as const;

export const MOCK_MESSAGES: Message[] = [
  {
    id: "m01",
    title: "Para você, agora.",
    body: "Hoje não precisa ser perfeito.\n\nBasta ser seu — com calma, com coragem do tamanho que couber no peito.\n\nO mundo continua girando, e você, aos poucos, também segue.",
    closing: "Guarda esse carinho.",
  },
  {
    id: "m02",
    title: "Um sopro leve.",
    body: "Se o peito apertou, lembre: respirar já é um ato de coragem.\n\nVocê não precisa provar nada a ninguém hoje — só existir com honestidade.",
    closing: "Estou torcendo por você.",
  },
  {
    id: "m03",
    title: "Neste instante.",
    body: "O que dói não define quem você é. Define apenas um capítulo — e capítulos passam.\n\nPermita-se um passo pequeno. Pequeno conta.",
    closing: "Com afeto.",
  },
  {
    id: "m04",
    title: "Bem aqui.",
    body: "Você tem direito ao descanso, ao erro, ao recomeço.\n\nA vida não é uma prova linear; é uma sequência de tentativas gentis.",
    closing: "Vá no seu tempo.",
  },
  {
    id: "m05",
    title: "Só passando para lembrar.",
    body: "Sua sensibilidade não é fraqueza — é forma de enxergar o mundo com profundidade.\n\nProteja isso em você.",
    closing: "Com carinho.",
  },
  {
    id: "m06",
    title: "Um abraço em palavras.",
    body: "Nem todo dia será leve. Mas nem todo dia precisa ser vencido de uma vez.\n\nHoje pode ser só sobre sobreviver com dignidade.",
    closing: "Você aguenta — e não precisa aguentar sozinho.",
  },
  {
    id: "m07",
    title: "Para o seu coração.",
    body: "A esperança às vezes vem miúda: um café quente, uma mensagem, um silêncio bom.\n\nAceite as formas pequenas dela.",
    closing: "Até o próximo bom sinal.",
  },
  {
    id: "m08",
    title: "Com calma.",
    body: "Você não está atrasado na vida. Está no seu ritmo, com suas batalhas reais.\n\nComparar roteiro rouba paz — devolva o foco para o seu caminho.",
    closing: "Seguimos.",
  },
  {
    id: "m09",
    title: "Lembrete suave.",
    body: "Fazer o possível já é suficiente alguns dias.\n\nO suficiente não é mediocridade — é humanidade.",
    closing: "Respira fundo.",
  },
  {
    id: "m10",
    title: "Pensando em você.",
    body: "As lágrimas limpam o que palavras não alcançam. Chore se precisar.\n\nDepois, enxugue com a mesma gentileza que você daria a um amigo.",
    closing: "Você merece esse cuidado.",
  },
  {
    id: "m11",
    title: "Hoje importa.",
    body: "Um 'não' seu também é um 'sim' para o seu bem-estar.\n\nLimites são cercas floridas, não muros de ódio.",
    closing: "Honre seus limites.",
  },
  {
    id: "m12",
    title: "Na medida certa.",
    body: "Gratidão não apaga a dor — mas ilumina o que ainda sustenta você de pé.\n\nOlhe para um motivo mínimo, se for o que houver.",
    closing: "Um de cada vez.",
  },
  {
    id: "m13",
    title: "Sem pressa.",
    body: "Recomeçar não é apagar o que foi. É escolher de novo, com o que você aprendeu.\n\nToda manhã é um convite — não uma cobrança.",
    closing: "Bom recomeço.",
  },
  {
    id: "m14",
    title: "Para você guardar.",
    body: "Você já superou 100% dos dias mais difíceis até aqui.\n\nNão é sorte — é força acumulada em silêncio.",
    closing: "Confie nessa história.",
  },
  {
    id: "m15",
    title: "Um instante de paz.",
    body: "Desacelere os ombros. Solte a mandíbula. Afrouxe a testa.\n\nO corpo ouve o que a mente nega — mime os dois.",
    closing: "Paz se treina em pequenos gestos.",
  },
  {
    id: "m16",
    title: "Com fé no caminho.",
    body: "O que você busca com sinceridade encontra resposta no tempo certo — nem sempre no formato esperado.\n\nMantenha o coração aberto.",
    closing: "Luz no próximo passo.",
  },
  {
    id: "m17",
    title: "Do tamanho certo.",
    body: "Seu valor não cabe no que deram ou tiraram de você.\n\nEle mora na sua existência, inteira.",
    closing: "Inteiro, você já basta.",
  },
  {
    id: "m18",
    title: "Um lembrete gentil.",
    body: "Pedir ajuda é coragem, não falha.\n\nAs pontes se constroem quando alguém estende a mão — permita-se atravessar.",
    closing: "Você pode pedir.",
  },
  {
    id: "m19",
    title: "Para acalmar.",
    body: "O futuro é feito de hoje em pedaços. Não precisa resolver tudo de uma vez.\n\nSó o próximo pedaço.",
    closing: "Um passo.",
  },
  {
    id: "m20",
    title: "Bem-vindo ao agora.",
    body: "O que você sente é válido — nomeie sem julgar.\n\nNomear já diminui o peso.",
    closing: "Com você.",
  },
  {
    id: "m21",
    title: "Sussurro bom.",
    body: "Cuide da sua energia como quem cuida de uma chama: sem vento demais, sem abafar.\n\nEquilíbrio é ajuste contínuo.",
    closing: "Ajuste com carinho.",
  },
  {
    id: "m22",
    title: "Para seguir.",
    body: "Errar faz parte do aprender; desistir de si não.\n\nLevantar pode ser devagar — desde que seja de verdade.",
    closing: "De pé, no seu ritmo.",
  },
  {
    id: "m23",
    title: "Um cantinho de luz.",
    body: "A bondade que você espalha volta em formas estranhas — às vezes só como paz interior.\n\nMesmo assim, valeu a pena.",
    closing: "O bem conta.",
  },
  {
    id: "m24",
    title: "Fechando com carinho.",
    body: "Que este momento seja uma pausa boa no meio da correria.\n\nVocê pode voltar ao mundo mais leve por alguns minutos.",
    closing: "Até a próxima.",
  },
];
