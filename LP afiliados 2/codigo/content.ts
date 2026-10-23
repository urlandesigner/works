/**
 * CAMADA DE CONTEÚDO — o único arquivo a editar por produto.
 *
 * Trocar de produto = editar este arquivo. Nenhum componente muda.
 *
 * ESTADO ATUAL: rascunho real para o Prime Perform (Digistore24), não
 * exemplo genérico. Construído a partir do que é VERIFICÁVEL na página
 * oficial (ingredientes, selos, garantia). O que não dá para verificar
 * ou fabricar honestamente fica marcado com "[PENDING" — o build avisa
 * sobre esses campos (ver guarda no fim do arquivo). Não publicar antes
 * de resolver os pendentes.
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

  /** Dizer para quem NÃO serve compra credibilidade. */
  verdict: {
    title: string;
    forWhomTitle: string;
    notForWhomTitle: string;
    forWhom: string[];
    notForWhom: string[];
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
    name: "Prime Perform Dietary Supplement (60 Capsules)",
    shortName: "Prime Perform",
    /**
     * PENDENTE DE DECISÃO — não é premissa neutra, tem risco de marca.
     *
     * "Prime Perform" é provavelmente nome protegido do vendor no
     * Digistore24. Dar lance na keyword de marca como afiliado, competindo
     * com o anunciante oficial, é o risco de trademark já registrado no
     * plano — e a maioria dos vendors de Digistore24/ClickBank proíbe
     * isso explicitamente nos "termos de afiliado" ou "PPC guidelines" do
     * programa (independente da política do Google). Confira isso na área
     * de afiliado antes de rodar campanha — violar o termo do vendor pode
     * zerar a comissão, não só reprovar o anúncio.
     *
     * Por isso o termo abaixo é por CATEGORIA, não pela marca. Trocar
     * pela keyword real da campanha antes de publicar.
     */
    targetSearchTerm: "natural male vitality supplement",
    /**
     * Link de afiliado real (ID: urlandipre), verificado ponta a ponta.
     *
     * O `#aff=` é fragmento, então NÃO chega ao servidor — quem lê é o
     * script do Digistore24 no navegador, que grava cookie `ds24c.v1` e
     * localStorage `ds24p.v1` com o aff, limpa a URL e reescreve os
     * botões de compra da página oficial para
     * `checkout-ds24.com/product/{id}?aff=urlandipre`. Conferido: o aff
     * chega ao checkout como query param de verdade.
     *
     * CONSEQUÊNCIA: o rastreio depende de JavaScript no navegador do
     * visitante. É o formato padrão do vendor e funciona para
     * praticamente todo mundo, mas com JS bloqueado a comissão não
     * registra. Alternativa mais robusta, se algum dia quiser pular a
     * página oficial: linkar direto um dos checkouts
     * (619569 / 619570 / 619571 = pacotes de 1, 3 e 6 frascos), onde o
     * aff já é query param. Custo: perde a página de vendas do vendor,
     * que é otimizada para converter, e fixa um pacote só.
     */
    checkoutUrl: "https://primeperformpro.com/welcome/#aff=urlandipre",
  },

  hero: {
    /**
     * Framing deliberadamente sobre "vitalidade/energia", não sobre
     * "ereção"/prazer sexual — Google Ads proíbe ads que foquem em
     * "sexual pleasure or enhancement" (ver conversa). Isso reduz risco
     * na NOSSA página, mas não elimina: o CTA leva ao checkout oficial,
     * que é explícito, e o funil é avaliado até lá.
     */
    headline: "Rediscover Your Energy and Vitality — Naturally",
    subheadline:
      "A plant-based formula with ingredients like Tongkat Ali and Saw Palmetto, made in a GMP-certified, FDA-registered facility in the USA.",
    ctaLabel: "Get My Special Offer",
    ctaReassurance: "60-day money-back guarantee · Free shipping",
    /**
     * Foto real, baixada da página oficial do produto (com sua
     * confirmação) — não é print de tela do site, é o asset de produto
     * que o próprio vendor usa. 68 KB, dentro do orçamento de 200 KB.
     */
    image: {
      src: "/product-bottle.webp",
      alt: "Prime Perform supplement bottle",
      width: 768,
      height: 706,
    },
  },

  proofBar: {
    /**
     * Só itens VERIFICÁVEIS (selo do rótulo, certificação). A oficial
     * usa "15,634 reviews" e "96% compram o pack de 6" — números do
     * vendor, não verificados por nós. Não reproduzir como fato nosso.
     */
    items: [
      "GMP-certified manufacturing",
      "Made in an FDA-registered facility",
      "Non-GMO, plant-based formula",
    ],
    badgeImage: {
      src: "/certifications.webp",
      alt: "GMP Certified, Made in a FDA Registered facility, 100% Natural, Made in USA, GMO Free",
      width: 768,
      height: 130,
    },
  },

  verdict: {
    title: "Is This Right for You?",
    forWhomTitle: "Good fit if you…",
    notForWhomTitle: "Not a good fit if you…",
    forWhom: [
      "Want a natural, non-prescription option to support energy and vitality",
      "Are comfortable taking a daily supplement for several weeks before judging results",
      "Have talked to a doctor and have no condition that interacts with herbal ingredients",
    ],
    notForWhom: [
      "Have diagnosed erectile dysfunction and need prescription-strength treatment — talk to a doctor first",
      "Expect results in days rather than weeks",
      "Take medication that may interact with herbal extracts without checking with a doctor first",
    ],
  },

  analysis: {
    title: "What We Know About These Ingredients",
    /**
     * ESCOPO DECLARADO: análise de INGREDIENTES, não de uso pessoal.
     *
     * O intro diz isso ao leitor com todas as letras ("not a personal
     * test"), e é por isso que ele pode ir ao ar sem mentir. Continua
     * cumprindo o papel anti-bridge-page porque é conteúdo original e
     * crítico, não resumo da página oficial: aponta que Saw Palmetto é
     * sobre próstata e não libido, e que "resultados em 7 dias" é
     * alegação de marketing.
     *
     * NUNCA fabricar "usei por X meses" aqui. Se um dia houver teste
     * real, reescreva intro e points com a experiência de quem testou —
     * é a versão mais forte, e aí o escopo declarado muda junto.
     */
    intro:
      "Prime Perform combines seven plant and mineral extracts commonly found in men's vitality supplements. Here's honest, general context on each — not a personal test of this specific product.",
    points: [
      {
        benefit: "Epimedium is the traditional anchor of this category",
        evidence:
          "Also known as horny goat weed, Epimedium is one of the most common ingredients across men's vitality supplements. Most of its research is preclinical (lab and animal studies) rather than large human trials — long history of traditional use, thinner clinical evidence than that history might suggest.",
        image: {
          src: "/ingredient-epimedium.webp",
          alt: "Epimedium extract",
          width: 190,
          height: 192,
        },
      },
      {
        benefit: "Tongkat Ali is one of the more studied ingredients here",
        evidence:
          "Eurycoma Longifolia (Tongkat Ali) shows up in more clinical research than most of the other extracts in this formula. That doesn't guarantee results for any individual — but it's a reason it's a common anchor ingredient in this product category.",
        image: {
          src: "/ingredient-tongkat-ali.webp",
          alt: "Eurycoma Longifolia (Tongkat Ali) extract",
          width: 190,
          height: 192,
        },
      },
      {
        benefit: "Saw Palmetto is usually about prostate support, not libido",
        evidence:
          "In most supplement literature, Saw Palmetto is associated with prostate and urinary health rather than vitality directly. Its inclusion here is likely for general men's health support alongside the other ingredients, not as the main driver of the product's core claim.",
        image: {
          src: "/ingredient-saw-palmetto.webp",
          alt: "Saw Palmetto extract",
          width: 190,
          height: 192,
        },
      },
      {
        benefit: "Boron's role is plausible but the evidence is mixed",
        evidence:
          "Boron is sometimes included in this category for its studied role in hormone metabolism. The research base is smaller and mixed compared to Tongkat Ali — worth knowing if you're weighing why it's in the formula.",
      },
      {
        benefit: "\"Results in days\" is a marketing claim, not a guarantee",
        evidence:
          "The official page states most men notice a difference within 7 days. For a plant-based supplement (not a prescription drug), that timeline is optimistic — herbal formulas in this category more typically suggest several weeks of consistent use. Set expectations accordingly.",
      },
    ],
  },

  testimonials: [],
  testimonialsTitle: "What Customers Say",

  /**
   * [PENDING: decisão] Deixado null de propósito por agora.
   * Uma comparação honesta (ex: vs. tratamento prescrito) esbarra perto
   * de conselho médico — não é meu lugar decidir isso sem mais cuidado.
   * Revisitar com dados melhores antes de preencher.
   */
  comparison: null,

  /**
   * Fato verificável da página oficial (60 dias), não urgência inventada.
   * A oficial usa "before it sells out" e "96% buy the 6-bottle pack" —
   * escassez sem fonte, deliberadamente não reproduzida aqui.
   */
  guaranteeStrip: {
    text: "60-day money-back guarantee · Free shipping · No subscription",
  },

  pricing: {
    title: "Pricing",
    /**
     * Verificado direto nos 3 checkouts (não na LP oficial — aquela
     * seção carrega via JS e não populava no fetch):
     *   1 bottle (619569):  $89 total  → $89.00/bottle
     *   3 bottles (619571): $177 total → $59.00/bottle
     *   6 bottles (619570): $294 total → $49.00/bottle
     * "From" é o menor preço por frasco (pacote de 6) — o de 1 frasco é
     * o MAIOR, não o menor. Preço muda sem aviso (ver priceNote).
     */
    price: "From $49 per bottle",
    priceNote:
      "Prime Perform is sold in 1 ($89), 3 ($177 · $59/bottle), or 6-bottle packages ($294 · $49/bottle). Price is set by the official checkout and can change without notice — confirm before you commit.",
    includes: [
      "60 capsules per bottle",
      "Free shipping on every order",
      "60-day money-back guarantee",
    ],
  },

  faq: [
    {
      question: "How long before I notice results?",
      answer:
        "Plant-based supplements in this category typically suggest several weeks of consistent daily use. Individual results vary and aren't guaranteed. If you need a fast-acting or guaranteed solution, talk to a doctor about medical options.",
    },
    {
      question: "Is it safe to take with other medication?",
      answer:
        "Herbal ingredients can interact with prescription medication, especially blood pressure or heart medication. Check with your doctor before starting, particularly if you take any daily prescription.",
    },
    {
      question: "What if it doesn't work for me?",
      answer:
        "The official checkout backs Prime Perform with a 60-day money-back guarantee. Confirm the exact terms there before you buy.",
    },
    {
      question: "Do I need a prescription?",
      answer:
        "No — it's sold as an over-the-counter dietary supplement, not a prescription medication. It isn't a substitute for prescription treatment of a diagnosed medical condition.",
    },
    {
      question: "Where is it manufactured?",
      answer:
        "The label states GMP-certified manufacturing in an FDA-registered facility in the USA. Note: FDA-registered means the facility is registered, not that the product itself is FDA-approved — no dietary supplement is.",
    },
    {
      question: "Is my order private?",
      answer:
        "Discreet packaging and billing is standard for this product category. Confirm the specifics on the official checkout page before ordering.",
    },
    {
      question: "What's the shipping and return policy?",
      answer:
        "The official page states free shipping and a 60-day money-back guarantee. Policies can change — confirm both at checkout.",
    },
  ],
  faqTitle: "Frequently Asked Questions",

  finalCta: {
    title: "Ready to Learn More?",
    subtitle:
      "Purchase happens on the official manufacturer checkout, backed by their 60-day guarantee.",
  },

  affiliateDisclosure: {
    label: "Disclosure:",
    text: "This page contains affiliate links. If you purchase through the button above, we may earn a commission from the manufacturer at no extra cost to you. This does not affect the price you pay or the analysis above — every drawback listed is real.",
  },

  seo: {
    title: "Prime Perform Review: Ingredient Breakdown Before You Buy",
    description:
      "An honest, ingredient-level look at Prime Perform — what's studied, what's not, and who this supplement category is (and isn't) a good fit for.",
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
