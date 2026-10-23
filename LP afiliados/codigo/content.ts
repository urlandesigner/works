/**
 * CAMADA DE CONTEÚDO — o único arquivo a editar por produto.
 *
 * Trocar de produto = editar este arquivo. Nenhum componente muda.
 *
 * ESTADO ATUAL: ProDentim (ClickBank), probiótico oral em tablete.
 * Construído a partir do que é VERIFICÁVEL: o painel Supplement Facts
 * publicado, a página oficial do vendor e os termos de afiliado. O que
 * não dá para verificar fica marcado com "[PENDING" — o build avisa e o
 * robots.txt bloqueia indexação enquanto houver pendência.
 *
 * TROCA DE PRODUTO (histórico): era Advanced Muscle Plus (Digistore24)
 * até 2026-08-05. Trocado por decisão do usuário depois que a campanha
 * do produto anterior foi reprovada no Google Ads por "Fraude em
 * sistemas" + "Site comprometido" (decisão de investigação humana sobre
 * o domínio besthub.online, em contestação). O ProDentim foi escolhido
 * entre 3 candidatos por um motivo só: saúde bucal NÃO é categoria
 * restrita no Google Ads, ao contrário de glicemia/diabetes (Gluco6),
 * onde a própria lista de keywords sugerida pelo vendor levaria a
 * reprovação certa.
 *
 * ⚠️ PENDÊNCIAS QUE DEPENDEM DE TERCEIRO (ver marcadores no arquivo):
 *   1. Aprovação de afiliado + hoplink real do ClickBank
 *   2. Kit oficial de criativos (affiliates@prodentim-product.com) — os
 *      termos proíbem usar qualquer imagem que não venha do kit. Os dois
 *      diagramas em public/ são ORIGINAIS nossos, justamente por isso.
 *   3. Domínio definitivo (afeta legal.siteName e contactEmail)
 *
 * ⚠️ REGRA DE ANÚNCIO QUE MUDA EM RELAÇÃO AO PRODUTO ANTERIOR: os termos
 * proíbem usar a palavra "ProDentim" em QUALQUER anúncio PPC — não só
 * dar lance na marca. Os títulos e descrições do Google Ads não podem
 * conter o nome do produto. Na página, o nome é permitido e necessário.
 *
 * Antes de publicar, ver "Ao usar o template num produto real"
 * em ../plano-template-lp.md e rodar ../checklist-landing-page.md.
 */

export type Testimonial = {
  quote: string;
  author: string;
  /** Contexto específico ganha de elogio genérico. Ex: "usa há 8 meses". */
  context: string;
};

export type ComparisonRow = {
  criterion: string;
  /** Este produto. */
  product: string;
  /** A alternativa. Ser honesto aqui é o que dá credibilidade. */
  alternative: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Content = {
  /**
   * Faixa fina no topo (fundo escuro + dourado), decorativa. Opcional:
   * omitir se não houver texto que valha a pena — a página funciona
   * igual sem ela.
   */
  topBar?: {
    text: string;
  };

  product: {
    /** Nome completo, como aparece no anúncio oficial. */
    name: string;
    /**
     * Nome curto (1–3 palavras) para espaços apertados.
     *
     * Nome de e-commerce costuma ter 10+ palavras. Repetido como rótulo
     * em cada linha da comparação no mobile, o nome completo vira ruído
     * maior que o próprio conteúdo. Aqui entra "Chambord", não
     * "Cafeteira Prensa Francesa Bodum Chambord 350ml".
     */
    shortName: string;
    /**
     * Quem vende de fato — a empresa/plataforma para onde o visitante é
     * mandado. Usado nas páginas legais (/privacy, /terms, /contact).
     *
     * Vive aqui, e não escrito à mão em cada página, porque na troca de
     * produto anterior o nome do fabricante ficou fossilizado em três
     * arquivos legais e ninguém revisou — o tipo de defeito que só
     * aparece quando um revisor de política do Google lê a página.
     */
    vendor: string;
    /**
     * Termo de busca da campanha no Google Ads.
     * A headline PRECISA espelhar isto (message match).
     * Não é exibido — existe para manter a headline honesta.
     */
    targetSearchTerm: string;
    /** URL do checkout oficial (link de afiliado). Destino de todo CTA. */
    checkoutUrl: string;
  };

  hero: {
    /** 6–12 palavras, foca no RESULTADO. Espelha targetSearchTerm. */
    headline: string;
    /** 15–25 palavras, explica o como. */
    subheadline: string;
    /** Verbo de ação + valor, 1ª pessoa. Completa "Eu quero…". */
    ctaLabel: string;
    /** Redutor de receio ao lado do CTA. */
    ctaReassurance: string;
    image: {
      /** Mostra o RESULTADO, não print do produto. Comprimir à mão: < 200 KB. */
      src: string;
      alt: string;
      width: number;
      height: number;
    };
  };

  /** Prova social imediata no hero. Vazio = a barra some. */
  proofBar: {
    items: string[];
    /** Opcional: selo de certificações (GMP/FDA/etc.), ao lado do texto. */
    badgeImage?: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
  };

  /**
   * Empatia com a dor, ANTES de qualquer solução — a seção que faltava
   * na ordem recomendada (ver CLAUDE.md). Sem ela o visitante sai do
   * hero direto para um filtro e um dossiê técnico, sem nunca ver a
   * própria frustração nomeada.
   *
   * Descreve SINTOMA, nunca doença: "sangra ao escovar" é observação
   * cotidiana; "gengivite" ou "periodontite" seria alegação sobre
   * condição médica — proibido pelos termos de afiliado e reprovável no
   * Google Ads.
   */
  problem: {
    title: string;
    /** 2–3 parágrafos curtos. Reconhecimento, não venda. */
    paragraphs: string[];
    image: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
  };

  /** Dizer para quem NÃO serve compra credibilidade. */
  verdict: {
    title: string;
    forWhomTitle: string;
    notForWhomTitle: string;
    forWhom: string[];
    notForWhom: string[];
  };

  /**
   * Como funciona, em 3 passos escaneáveis.
   *
   * Existe porque a análise de ingredientes é densa e 79% das pessoas
   * escaneiam em vez de ler. Este é o resumo que quem escaneia leva
   * embora.
   */
  howItWorks: {
    title: string;
    steps: {
      title: string;
      description: string;
    }[];
  };

  /**
   * Endosso de terceiro, com o vínculo comercial DECLARADO.
   *
   * Só existe quando a pessoa foi verificada como real e verificável.
   * Um endosso pago exibido sem a divulgação do pagamento é violação
   * direta das regras da FTC — o campo `disclosure` não é opcional por
   * decisão de design, é a condição para a seção poder existir.
   */
  endorsement?: {
    name: string;
    credentials: string;
    /** O que ele afirma. Nunca colocar alegação de cura na boca dele. */
    quote: string;
    /** Divulgação do vínculo comercial. Exibida junto, não escondida. */
    disclosure: string;
  };

  /**
   * SEÇÃO ESTRUTURAL — nunca remover.
   * É o conteúdo original que evita reprovação por bridge page no
   * Google Ads e o que converte tráfego de busca. Sem análise real,
   * a página é uma ponte para o checkout e nasce reprovável.
   */
  analysis: {
    title: string;
    intro: string;
    points: {
      /** Benefício (ganho), não característica (spec). */
      benefit: string;
      /** Evidência de uso real. Genérico aqui destrói a seção. */
      evidence: string;
      /** Opcional: foto do ingrediente/detalhe. Nem todo ponto tem uma. */
      image?: {
        src: string;
        alt: string;
        width: number;
        height: number;
      };
    }[];
    /**
     * Peça de marketing OFICIAL do vendor, exibida como OBJETO DE
     * ANÁLISE — não como prova.
     *
     * A `caption` é obrigatória e é o que separa "citar" de "endossar".
     */
    vendorClaims?: {
      caption: string;
      image: {
        src: string;
        alt: string;
        width: number;
        height: number;
      };
    };
  };

  /** Opcional: vazio = seção some. Normal no primeiro produto. */
  testimonials: Testimonial[];
  /** Só usado quando testimonials não está vazio. */
  testimonialsTitle: string;

  /** Opcional: vazio = seção some. */
  comparison: {
    title: string;
    /** Curto (1–4 palavras): vira rótulo repetido em cada linha no mobile. */
    alternativeName: string;
    rows: ComparisonRow[];
  } | null;

  /**
   * Faixa dourada antes do preço — divisor visual de alto impacto.
   * Opcional. Uma linha só: é faixa, não seção. Usar para o argumento de
   * confiança mais forte (garantia, devolução), nunca para urgência
   * inventada.
   */
  guaranteeStrip?: {
    text: string;
  };

  pricing: {
    title: string;
    price: string;
    /** Preço muda no checkout oficial e está fora do seu controle. */
    priceNote: string;
    includes: string[];
    /**
     * Os pacotes reais do checkout. Vazio = renderiza só o preço "from"
     * (produto de preço único). Com itens, vira grade de cards.
     *
     * Marcar `highlight` em NO MÁXIMO um: o destaque só funciona por
     * contraste. Dois destaques = nenhum destaque.
     */
    tiers: {
      /** Ex: "6 Bottles". Curto — vira título do card. */
      name: string;
      /** Ex: "180-day supply". */
      supply: string;
      /** Preço unitário, o número grande. Ex: "$49". */
      unitPrice: string;
      /** Ex: "per bottle". */
      unitLabel: string;
      /** Total cobrado. Ex: "$294 total". */
      total: string;
      /** Vantagens do pacote. Vazio = card sem lista. */
      perks: string[];
      /** Destaque visual. No máximo um tier. */
      highlight?: boolean;
      /** Selo do card destacado. Ex: "Best Value". */
      badge?: string;
      /**
       * Foto do pacote — a MESMA da página oficial, quando houver
       * licença para usá-la. Fundo BRANCO, não recortado.
       */
      image?: {
        src: string;
        alt: string;
        width: number;
        height: number;
      };
    }[];
  };

  faq: FaqItem[];
  faqTitle: string;

  finalCta: {
    title: string;
    subtitle: string;
  };

  /**
   * Obrigatório por lei — FTC nos EUA, CONAR/CDC no Brasil, depende do
   * mercado-alvo. Visível, nunca escondido.
   */
  affiliateDisclosure: {
    /** Ex: "Disclosure:" (EUA) ou "Divulgação:" (Brasil). */
    label: string;
    text: string;
  };

  /**
   * Aviso da DSHEA — obrigatório nos EUA em qualquer página que faça
   * alegação de estrutura/função sobre suplemento. Esta faz.
   *
   * Texto padronizado pela própria FDA — não reescrever para soar
   * melhor: a redação é o que cumpre a exigência.
   */
  healthDisclaimer?: {
    text: string;
  };

  /**
   * Dados que alimentam as páginas legais (/privacy, /terms, /contact)
   * e o rodapé.
   */
  legal: {
    /** Nome público do site. Aparece no rodapé e nas três páginas. */
    siteName: string;
    /** Para onde o visitante escreve. Precisa existir e ser lido. */
    contactEmail: string;
    /** Data da última revisão, por extenso. Ex: "August 5, 2026". */
    lastUpdated: string;
  };

  seo: {
    title: string;
    description: string;
    /** <html lang>. Ex: "en" (EUA) ou "pt-BR" (Brasil). */
    lang: string;
    /** og:locale. Ex: "en_US" ou "pt_BR". */
    ogLocale: string;
    /**
     * URL pública do site, com protocolo (ex: "https://minhalp.com.br").
     * null enquanto não houver domínio — canonical e imagem de
     * compartilhamento (Open Graph) só entram com ele definido, senão
     * o Next resolveria os links absolutos contra localhost.
     *
     * Não editar à mão: vem de `resolveSiteUrl()` (abaixo).
     */
    siteUrl: string | null;
  };
};

/**
 * De onde sai a URL pública, em ordem de precedência.
 *
 * Existe para a LP funcionar em hospedagem provisória e no domínio final
 * sem editar código — canonical e og:image precisam de URL absoluta, e
 * errar isso publica link apontando para o lugar errado.
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — o domínio final. Definir quando existir
 *    (na Hostinger, num `.env.production`; na Vercel, em Environment
 *    Variables). Ganha de tudo.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — preenchida pela Vercel no build,
 *    sem protocolo. É a domínio de produção do projeto (se você apontar
 *    um domínio custom na Vercel, ela passa a ser esse domínio). Exige
 *    "Enable access to System Environment Variables" ligado no projeto.
 * 3. `null` — dev local. Sem canonical e sem og:image, de propósito:
 *    melhor ausente do que apontando para localhost.
 */
function resolveSiteUrl(): string | null {
  const explicito = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicito) return explicito.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return null;
}

export const content: Content = {
  /**
   * Duplo propósito: dá peso visual (marca) e deixa claro, antes mesmo
   * do hero, que esta não é a loja oficial — reforça a transparência
   * que já sustenta a seção de análise (anti-bridge-page).
   */
  topBar: {
    text: "Independent Review — Not an Official Store",
  },

  product: {
    name: "ProDentim (30 Soft Tablets)",
    shortName: "ProDentim",
    vendor: "ProDentim",
    /**
     * Por CATEGORIA, não pela marca — e aqui a regra é mais dura que no
     * produto anterior. Os termos do ProDentim proíbem literalmente
     * "use the term 'ProDentim' in any pay-per-click advertisements".
     * Não é só proibição de dar lance na marca: a palavra não pode
     * aparecer no criativo. Toda keyword e todo título de anúncio saem
     * da categoria.
     */
    targetSearchTerm: "oral probiotic for gum health",
    /**
     * [PENDING: AFFILIATE_ID] Hoplink real do ClickBank.
     *
     * Diferente do produto anterior (Digistore24, `?aff=` na URL do
     * vendor), aqui o rastreio é do ClickBank: o link sai do gerador de
     * hoplink da página de afiliados, no formato
     * https://<afiliado>.<vendor>.hop.clickbank.net.
     *
     * Duas coisas travam isso, e as duas dependem de terceiro:
     *   1. O ProDentim exige APROVAÇÃO ("Requires approval — please
     *      submit your Clickbank ID and Traffic Sources"). Conta aberta
     *      no ClickBank não basta.
     *   2. O nickname de vendor no ClickBank não é público; só aparece
     *      no gerador depois de aprovado. Não chutar — hoplink com
     *      vendor errado não rastreia e a comissão se perde em silêncio.
     *
     * Enquanto for placeholder, `pendenciasDeConteudo()` mantém a
     * indexação bloqueada. É o comportamento certo.
     */
    checkoutUrl: "https://hop.clickbank.net/?affiliate=AFFILIATE_ID&vendor=PENDING",
  },

  hero: {
    headline: "Your Mouth Has a Microbiome. Most Mouthwash Ignores It.",
    subheadline:
      "An independent, ingredient-level look at ProDentim — the 3.5-billion-CFU oral probiotic tablet — covering which strains have real evidence behind them and which do not.",
    ctaLabel: "See Today's Official Price",
    ctaReassurance: "60-day money-back guarantee",
    /**
     * Diagrama ORIGINAL nosso, não foto do produto — decisão forçada
     * pelos termos de afiliado, que restringem o uso de imagem ao que o
     * vendor fornecer por escrito ("Affiliate may use only content,
     * images, videos... provided by Company in writing or that Affiliate
     * has all necessary rights and licenses to use"). Sem o kit oficial,
     * pegar a foto da página de vendas seria violação, e a punição
     * declarada é banimento imediato sem reinstatement.
     *
     * Efeito colateral bom: um corte do tablete com as cepas nomeadas
     * comunica "análise independente" melhor do que uma foto de frasco
     * — que é exatamente o que a página vende.
     *
     * SVG, então peso irrelevante para o LCP (2,6 KB).
     */
    image: {
      src: "/tablet-breakdown.svg",
      alt: "Breakdown of one ProDentim tablet: 3.5 billion CFU total across L. reuteri DSM 17938, L. paracasei ET-22 and B. lactis BL-04, plus inulin",
      width: 700,
      height: 700,
    },
  },

  proofBar: {
    /**
     * Só itens VERIFICÁVEIS no painel Supplement Facts publicado e na
     * página oficial. Deliberadamente FORA daqui: qualquer menção a
     * "clinicamente comprovado" — não existe ensaio publicado da fórmula
     * final, e repetir isso seria a alegação mais frágil da página.
     */
    items: [
      "3.5 billion CFU per tablet (at time of manufacture)",
      "Three named probiotic strains + inulin prebiotic",
      "60-day money-back guarantee via ClickBank",
    ],
    /**
     * [PENDING: kit de criativos] O selo aqui deve ser a foto do painel
     * Supplement Facts real, do kit oficial de afiliado. Omitido até lá
     * — badgeImage é opcional e a barra funciona sem ele.
     */
  },

  problem: {
    title: "You Brush. You Floss. The Pink in the Sink Comes Back.",
    paragraphs: [
      "The routine hasn't changed. Twice a day, floss most nights, the mouthwash that stings. And still: a little pink when you spit, and breath that goes stale by mid-morning no matter what you did at 7am.",
      "Here's what the routine doesn't account for. Your mouth hosts hundreds of bacterial species, and only a small share of them cause trouble. A broad antibacterial rinse can't tell them apart — it clears the whole surface, and whatever grows back first takes the space.",
      "That gap is what this category of product aims at: adding specific bacteria rather than removing all of them. Whether this particular formula does that in a way that matters is exactly what the rest of this page examines.",
    ],
    /** Diagrama original nosso — mesmo motivo do hero. */
    image: {
      src: "/oral-microbiome.svg",
      alt: "Diagram of the oral microbiome: most species are harmless or helpful, only a few drive plaque and odour",
      width: 560,
      height: 525,
    },
  },

  verdict: {
    title: "Is This Right for You?",
    forWhomTitle: "Good fit if you…",
    notForWhomTitle: "Not a good fit if you…",
    forWhom: [
      "Want to add an oral probiotic on top of brushing, flossing and regular cleanings — not in place of them",
      "Are comfortable giving a daily tablet the full 60 days before judging it",
      "Prefer reading the actual label and the state of the evidence before you buy",
    ],
    notForWhom: [
      "Have bleeding that doesn't stop, pain, or a loose tooth — that is a dentist visit, and no supplement is a substitute for one",
      "Are looking for something to replace brushing, flossing or professional cleaning",
      "Want a product with published clinical trials on the finished formula — those don't exist for this one, only on individual ingredients",
      "Are immunocompromised, pregnant, or on prescription medication without checking with your doctor first",
    ],
  },

  howItWorks: {
    title: "How It's Meant to Work",
    steps: [
      {
        title: "One soft tablet a day",
        description:
          "Chewed or dissolved slowly in the mouth rather than swallowed whole — the point is contact with the mouth, not the gut. Each bottle holds 30 tablets, a 30-day supply.",
      },
      {
        title: "Three strains plus a prebiotic fibre",
        description:
          "The blend pairs three named probiotic strains with inulin, a fibre included to feed them. The idea is to add specific bacteria to the mouth rather than strip everything out.",
      },
      {
        title: "Your normal routine still does the work",
        description:
          "This is an addition, not a replacement. Brushing, flossing and professional cleanings remain the things with the strongest evidence behind them for teeth and gums.",
      },
    ],
  },

  /**
   * [PENDING: verificação] A página de afiliados afirma "Endorsed and
   * presented by a reputed doctor with decades of experience", mas não
   * nomeia essa pessoa em lugar nenhum do material público.
   *
   * Seção OMITIDA de propósito. No produto anterior o endosso entrou
   * porque a pessoa foi verificada nome a nome (naturopata licenciado,
   * ex-presidente de conselho estadual, nomeado pelo governador).
   * Aqui não há nome para verificar — e exibir "um médico respeitado"
   * sem identidade é exatamente o padrão de endosso vazio que a página
   * critica nos concorrentes. Se o kit oficial trouxer o nome, verificar
   * antes de usar e incluir `disclosure` de pagamento junto.
   */

  analysis: {
    title: "What the Evidence Says About These Strains",
    /**
     * ESCOPO DECLARADO: análise de INGREDIENTES a partir do painel
     * Supplement Facts publicado — não é teste pessoal do produto.
     *
     * O ponto mais importante da seção é o item 5 (nenhum ensaio da
     * fórmula final) e o item 6 (as alegações fora da boca). São os dois
     * que separam esta página de uma resenha de fachada — e os dois que
     * o vendor não vai gostar. Ficam, porque a alternativa é repetir
     * alegação que a página não pode sustentar.
     */
    intro:
      "ProDentim is a chewable tablet built around three probiotic strains, a prebiotic fibre and a few supporting ingredients. Here is honest, general context on each — based on the published label and the state of the research, not on a personal test of this product.",
    points: [
      {
        benefit: "L. reuteri is the strain with the strongest oral-health record",
        evidence:
          "Of the three strains here, Lactobacillus reuteri has the most credible research in the mouth specifically. Human trials have shown modest reductions in gum bleeding and inflammation markers. Two things to keep in perspective: the effects reported are modest, not dramatic, and probiotic research is strain-specific — results from one strain don't automatically transfer to another, even within the same species.",
      },
      {
        benefit: "The other two strains have thinner evidence for the mouth",
        evidence:
          "Bifidobacterium lactis BL-04 is a genuinely well-studied strain, but most of that work is on immune and respiratory outcomes, not on teeth and gums. Lactobacillus paracasei has some oral-health research behind it, though often using different strains than the one in this blend. Neither is a bad ingredient; the honest framing is that their oral-cavity evidence is weaker than L. reuteri's, not that it's absent.",
      },
      {
        benefit: "The CFU number is for the blend, not per strain",
        evidence:
          "The label reports 3.5 billion CFU for the proprietary blend as a whole, with no breakdown of how much comes from each strain. That's normal for the category and legal, but it means you cannot tell whether the well-evidenced strain makes up most of the dose or a small fraction of it. Also note the wording \"at time of manufacture\" — live cultures decline over shelf life, so the count on the day you take it is lower than the count on the label.",
      },
      {
        benefit: "Inulin, malic acid and tricalcium phosphate are real ingredients with modest roles",
        evidence:
          "Inulin is a well-established prebiotic fibre, though most of its research concerns gut flora rather than the mouth. Malic acid occurs naturally in fruit and is commonly used in oral-care products. Tricalcium phosphate is a genuine source of calcium and phosphate, the minerals enamel is built from. Peppermint contributes flavour. None of these are filler — but none of them are the reason to buy an oral probiotic either.",
      },
      {
        benefit: "No independent trial of the finished formula has been published",
        evidence:
          "This is the single most important thing to understand before buying. Every claim made for this product rests on research into individual ingredients — often at different doses, in different delivery formats, and in different populations than this tablet. A blend is not the sum of its studies. Until someone publishes a trial on this exact formula, \"clinically proven ingredients\" and \"clinically proven product\" remain two very different statements.",
      },
      {
        benefit: "The claims beyond the mouth are the weakest part of the pitch",
        evidence:
          "The official material extends the promise to the respiratory tract, allergies, digestion and weight loss. We would treat that stack with real scepticism. B. lactis BL-04 does have respiratory-related research behind it, which is likely where the respiratory claim originates — but a 20 mg blend delivered as a mouth-dissolving tablet is not the same intervention as the capsules used in those studies. For allergies and weight loss in particular, we found nothing that would support the claim at this dose and format.",
      },
    ],
    /**
     * [PENDING: kit de criativos] `vendorClaims` omitido: exibir o
     * gráfico promocional do vendor exige tê-lo licenciado, e o kit
     * ainda não chegou. No produto anterior essa peça funcionou bem
     * como OBJETO de análise (mostrar o que se promete, e refutar logo
     * abaixo). Vale repetir aqui quando o kit chegar.
     */
  },

  /**
   * Vazio por OBRIGAÇÃO, não só por escolha: os termos do ProDentim
   * proíbem usar depoimentos e fotos antes/depois deles sem permissão
   * expressa ("may not use any ProDentim 'before and after photos' or
   * user testimonials in their promotions unless permitted under our
   * Advertising Rules"). E inventar depoimento está fora de questão.
   */
  testimonials: [],
  testimonialsTitle: "What Customers Say",

  /**
   * [PENDING: decisão] Null de propósito. Comparar com escova elétrica,
   * enxaguante ou outro probiótico oral exigiria mais cuidado do que dá
   * pra fazer sem revisão profissional — e comparação mal feita numa
   * página de saúde é pior que nenhuma.
   */
  comparison: null,

  guaranteeStrip: {
    text: "60-Day Money-Back Guarantee — Returns Handled by ClickBank",
  },

  pricing: {
    title: "Pricing",
    /**
     * ⚠️ ORIGEM DOS NÚMEROS, para quem for revisar: a página oficial
     * injeta os preços por JavaScript em runtime — não estão no HTML
     * estático, então não deu para confirmar por requisição direta como
     * foi feito no produto anterior. Os valores abaixo ($69 / $59 / $49
     * por frasco) são o que múltiplas fontes secundárias independentes
     * reportam de forma consistente em 2026, e batem com o frete
     * internacional de $15,95 que ESTE sim está no HTML oficial.
     *
     * CONFERIR no funil real assim que a aprovação de afiliado sair, e
     * corrigir aqui se divergir. O `priceNote` já avisa o visitante de
     * que o checkout é a autoridade — mas isso não substitui conferir.
     */
    price: "From $49 per bottle",
    priceNote:
      "ProDentim is sold in 1-bottle ($69), 3-bottle ($177 · $59/bottle) or 6-bottle packages ($294 · $49/bottle). Free US shipping applies to the 3- and 6-bottle packages; international orders carry a shipping fee. Prices are set by the official checkout and change without notice — confirm there before you commit.",
    includes: [
      "30 soft tablets per bottle (30-day supply at one tablet a day)",
      "60-day money-back guarantee",
      "Free US shipping on 3- and 6-bottle packages",
    ],
    /**
     * Ordem deliberada: 1 → 6 → 3, com o de 6 no MEIO e destacado.
     * Ancoragem: ver $69 primeiro faz o $49 do meio parecer ganho, não
     * gasto. Não é truque — os 3 preços são reais e o total de cada um
     * está à mostra.
     *
     * Sem `image` nos cards: as fotos de pacote pertencem ao vendor e
     * dependem do kit de criativos. Os cards funcionam sem elas.
     */
    tiers: [
      {
        name: "1 Bottle",
        supply: "30-day supply",
        unitPrice: "$69",
        unitLabel: "per bottle",
        total: "$69 total",
        perks: ["60-day money-back guarantee"],
      },
      {
        name: "6 Bottles",
        supply: "180-day supply",
        unitPrice: "$49",
        unitLabel: "per bottle",
        total: "$294 total",
        perks: [
          "Free US shipping",
          "2 free digital bonuses",
          "60-day money-back guarantee",
        ],
        highlight: true,
        badge: "Best Value",
      },
      {
        name: "3 Bottles",
        supply: "90-day supply",
        unitPrice: "$59",
        unitLabel: "per bottle",
        total: "$177 total",
        perks: [
          "Free US shipping",
          "2 free digital bonuses",
          "60-day money-back guarantee",
        ],
      },
    ],
  },

  faq: [
    {
      question: "Does this replace brushing and flossing?",
      answer:
        "No, and nothing on the label suggests it should. Brushing, flossing and professional cleanings have decades of evidence behind them; an oral probiotic is positioned as an addition to that routine, not a substitute for it. If you stop the basics and take this instead, you are trading a proven intervention for an unproven one.",
    },
    {
      question: "What is actually in it?",
      answer:
        "Per tablet: a 20 mg proprietary probiotic blend reported at 3.5 billion CFU at time of manufacture, made up of Lactobacillus paracasei, Lactobacillus reuteri and Bifidobacterium lactis BL-04; 100 mg of inulin from chicory root; plus malic acid, tricalcium phosphate and peppermint. The label does not break the CFU count down by individual strain — see the ingredient analysis above for what that means in practice.",
    },
    {
      question: "Will it fix bad breath?",
      answer:
        "Some oral probiotic strains have research showing reductions in the sulphur compounds behind mouth odour, and L. reuteri is among the better-studied ones for oral use. But no trial has been published on this specific formula, and persistent bad breath often comes from something a supplement won't touch — an untreated cavity, gum inflammation, dry mouth, sinus drainage, or reflux. Worth ruling those out with a dentist rather than assuming a tablet will handle it.",
    },
    {
      question: "Are there side effects?",
      answer:
        "Probiotics are generally well tolerated, with mild and temporary digestive upset the most commonly reported effect when starting. The exceptions matter more than the rule here: if you are immunocompromised, have a central venous catheter, are pregnant or nursing, or take prescription medication, talk to your doctor before starting any probiotic. Check the full label for allergens if you react to dairy-derived ingredients.",
    },
    {
      question: "What about the claims for allergies, digestion and weight loss?",
      answer:
        "That is the part of the pitch we would treat most sceptically. The respiratory claim likely traces back to research on B. lactis BL-04, but those studies used different doses and delivery formats than a mouth-dissolving tablet. For allergies and weight loss specifically, we found nothing that would support the claim at this dose. Judge this product on oral health, which is where the research actually sits.",
    },
    {
      question: "What is the return policy?",
      answer:
        "The official page states a 60-day money-back guarantee. Purchases are processed by ClickBank as the retailer, so refunds go through ClickBank's own return process rather than through this site. Confirm the exact steps and time limit on the official checkout before you buy — we have no access to orders and cannot issue refunds.",
    },
    {
      question: "Do I need a prescription?",
      answer:
        "No. It is sold as an over-the-counter dietary supplement, not a medication, and it is not a substitute for dental treatment or for anything your dentist or doctor has prescribed.",
    },
  ],
  faqTitle: "Frequently Asked Questions",

  finalCta: {
    title: "Ready to Look at the Official Offer?",
    subtitle:
      "Purchase happens on the official ProDentim checkout, processed by ClickBank and backed by their 60-day money-back guarantee.",
  },

  affiliateDisclosure: {
    label: "Disclosure:",
    text: "This page contains affiliate links. If you purchase through the button above, we may earn a commission at no extra cost to you. This does not affect the price you pay or the analysis above — every caution listed here is real, including the ones the manufacturer would rather we left out.",
  },

  healthDisclaimer: {
    text: "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. This page is for informational purposes only and is not medical or dental advice — talk to your dentist or doctor before starting any supplement, especially if you take prescription medication or have a diagnosed condition.",
  },

  /**
   * PENDENTES REAIS, não descuido: o domínio do produto anterior
   * (besthub.online) está com duas violações de política em investigação
   * no Google Ads, então o nome do site e o e-mail dependem da decisão
   * de domínio que ainda não foi tomada.
   *
   * Enquanto estiverem assim, `pendenciasDeConteudo()` bloqueia a
   * indexação e o build avisa — que é o comportamento certo, porque
   * publicar política de privacidade com contato falso é pior do que não
   * ter política nenhuma.
   */
  legal: {
    siteName: "[PENDING: nome do site, depende do domínio]",
    contactEmail: "[PENDING: e-mail no domínio final]",
    lastUpdated: "August 5, 2026",
  },

  seo: {
    title: "ProDentim Review: What the Label Shows Before You Buy",
    description:
      "An honest, ingredient-level look at ProDentim — the three probiotic strains, the CFU count, and the claims that go beyond what the research supports.",
    lang: "en",
    ogLocale: "en_US",
    siteUrl: resolveSiteUrl(),
  },
};

/**
 * Avisos de build — o guarda contra publicar o esqueleto (ou um rascunho
 * com pendências) como se fosse LP pronta.
 *
 * Roda só no servidor (build e dev), nunca no navegador do visitante.
 * Build silencioso = conteúdo passou nas réguas do CLAUDE.md.
 */
const PLACEHOLDER_MARKERS = ["[PENDING", "exemplo", "PRODUCT_ID", "AFFILIATE_ID"];

/**
 * Campos que ainda têm placeholder, com o marcador encontrado.
 *
 * Exportado porque o robots.txt depende disso: uma LP de afiliado
 * indexada com texto "[PENDING]" à mostra é conteúdo raso, o alvo
 * exato do sistema de helpful content do Google. Ser indexado assim e
 * corrigir depois é pior que não ser indexado — a reputação do domínio
 * demora a voltar.
 */
export function pendenciasDeConteudo(): string[] {
  const pendencias: string[] = [];

  const checar = (campo: string, valor: string) => {
    const marcador = PLACEHOLDER_MARKERS.find((m) => valor.includes(m));
    if (marcador) {
      pendencias.push(`${campo} ainda tem placeholder (“${marcador}”) — não publicar assim.`);
    }
  };

  checar("product.checkoutUrl", content.product.checkoutUrl);
  checar("hero.image.src", content.hero.image.src);
  checar("pricing.price", content.pricing.price);
  checar("analysis.intro", content.analysis.intro);
  // As páginas legais são linkadas do rodapé e revisadas pelo Google
  // Ads. Nome de site e e-mail com placeholder ali valem tanto quanto
  // headline com placeholder — daí entrarem na mesma guarda.
  checar("legal.siteName", content.legal.siteName);
  checar("legal.contactEmail", content.legal.contactEmail);

  return pendencias;
}

/** Verdadeiro só quando nenhum campo crítico tem placeholder. */
export function conteudoEstaPronto(): boolean {
  return pendenciasDeConteudo().length === 0;
}

if (typeof window === "undefined") {
  const avisos: string[] = [...pendenciasDeConteudo()];

  try {
    // eslint-disable-next-line no-new
    new URL(content.product.checkoutUrl);
  } catch {
    avisos.push(`product.checkoutUrl não é uma URL válida: "${content.product.checkoutUrl}".`);
  }

  // Só avisa em build de hospedagem (CI/Vercel). Em dev local, siteUrl
  // null é o esperado e o aviso seria ruído a cada recompilação.
  const emDeploy = Boolean(process.env.CI || process.env.VERCEL);
  if (emDeploy && !content.seo.siteUrl) {
    avisos.push(
      "seo.siteUrl não resolveu num build de deploy — a página vai ao ar sem canonical e sem imagem de compartilhamento. " +
        "Na Vercel: ligar “Enable access to System Environment Variables” em Settings → Environment Variables, " +
        "ou definir NEXT_PUBLIC_SITE_URL com o domínio final.",
    );
  }

  const palavrasHeadline = content.hero.headline.trim().split(/\s+/).length;
  if (palavrasHeadline < 6 || palavrasHeadline > 12) {
    avisos.push(
      `hero.headline com ${palavrasHeadline} palavras — a régua é 6 a 12, focadas no resultado.`,
    );
  }

  if (content.faq.length < 5 || content.faq.length > 7) {
    avisos.push(
      `faq com ${content.faq.length} itens — a régua é 5 a 7 objeções reais.`,
    );
  }

  if (avisos.length > 0) {
    console.warn(
      "\n[template-lp] Conteúdo ainda não está pronto para publicar:\n" +
        avisos.map((a) => `  • ${a}`).join("\n") +
        "\n",
    );
  }
}
