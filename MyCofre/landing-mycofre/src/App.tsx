import { useEffect, useState } from 'react'
import heroLoopVideo from '../videos/video1.mp4'
import stepsLoopVideo from '../videos/video2.mp4'

/*
 * ⚠️ PLACEHOLDERS A CONFIRMAR ANTES DO LANÇAMENTO:
 * - CHECKOUT_URL: link real do checkout (Kiwify/Hotmart).
 * - OFFER: preço, âncora de mensalidade, total e vagas restantes da oferta de lançamento.
 * - testimonials: depoimentos fictícios — trocar por reais (publicidade enganosa).
 * - Links de Privacidade/Termos no footer.
 */
const CHECKOUT_URL = 'https://pay.kiwify.com.br/SEU-CHECKOUT' // PLACEHOLDER
const APP_URL = 'https://app.mycofre.com'

const MASCOT = {
  hero: '/images/pig4.png', // variante do porco usada no hero
  cta: '/images/pig.png', // porco original reaproveitado no CTA final
} as const

const BRAND_VIDEOS = {
  heroLoop: heroLoopVideo,
  stepsLoop: stepsLoopVideo,
} as const

/*
 * OFERTA — núcleo da conversão. Pagamento único, acesso vitalício.
 * PLACEHOLDER: ajustar valores reais antes do lançamento.
 */
const OFFER = {
  name: 'Licença Vitalícia',
  price: 97,            // pagamento único (R$)
  anchorMonthly: 19,    // mensalidade equivalente — usada só como âncora riscada
  guaranteeDays: 7,
  totalSeats: 200,      // vagas da oferta de lançamento
  remainingSeats: 137,  // restantes (idealmente vindo do Kiwify)
} as const

const offerIncludes = [
  'Acesso vitalício a todas as funções, sem mensalidade, para sempre',
  'Patrimônio líquido real em tempo real',
  'Contas, cartões, metas e investimentos ilimitados',
  'Atualizações futuras incluídas, sem custo extra',
  'Funciona no celular e no computador',
  'Suporte direto por e-mail',
] as const

// Anos de mensalidade que o preço único "paga" — usado na ancoragem.
const breakEvenMonths = Math.max(1, Math.round(OFFER.price / OFFER.anchorMonthly))

const benefits = [
  {
    key: 'tudo',
    title: 'Pare de adivinhar quanto você tem',
    description:
      'Contas, cartões, metas e investimentos numa visão única. O número que importa, sem abas infinitas.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7.5c0-1.1.9-2 2-2h5l2 2h5c1.1 0 2 .9 2 2V17c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V7.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'patrimonio',
    title: 'Veja seu patrimônio líquido de verdade',
    description:
      'Saldo em contas + investimentos − faturas em aberto. Um número coerente com a sua realidade, atualizado sozinho.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6.5 7.5h12a1.5 1.5 0 0 1 1.5 1.5v8.5H5V9a1.5 1.5 0 0 1 1.5-1.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8 7.5V6a2.5 2.5 0 0 1 2.5-2.5h3A2.5 2.5 0 0 1 16 6v1.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M9.5 12.2c.5-1.2 1.6-1.4 2.1-.2.4 1 1.1 1.2 1.6.3.4-.6 1.2-.5 1.5.2.2.4.1.8-.1 1.1"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
    variant: 'b' as const,
  },
  {
    key: 'metas',
    title: 'Alcance metas sem culpa, com consistência',
    description:
      'Defina objetivos, acompanhe o progresso todo dia e ajuste o curso. A viagem, a reserva, a liberdade saem do papel.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3m-.4 6.4 2.1-2.1M12 21v-3m6.4.4-2.1-2.1M21 12h-3m.4-6.4-2.1 2.1"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
] as const

// Sinais de confiança — agora ancorados na oferta vitalícia.
const trustItems = [
  'Pagamento único',
  'Acesso vitalício',
  `${OFFER.guaranteeDays} dias de garantia`,
  'Dados criptografados',
] as const

// Dores que o público-alvo reconhece — base da seção de agitação.
const painPoints = [
  {
    title: 'Planilhas que você abandona',
    text: 'Toda virada de mês a promessa de organizar tudo, e a planilha que some na terceira semana.',
  },
  {
    title: 'Você não sabe quanto realmente tem',
    text: 'Saldo na conta não é patrimônio. Faltam as faturas em aberto, os investimentos, o número que importa.',
  },
  {
    title: 'Assinatura que nunca acaba',
    text: 'Mais um app cobrando todo mês. Você paga, esquece, e a mensalidade segue saindo da sua conta.',
  },
] as const

// Antes → Depois: a virada concreta que o MyCofre entrega.
const beforeAfter = {
  before: [
    'Dinheiro espalhado em 4 apps diferentes',
    'Patrimônio? Um chute na cabeça',
    'Planilha abandonada no terceiro mês',
    'Mais uma mensalidade pra sempre',
  ],
  after: [
    'Tudo num só lugar, atualizado sozinho',
    'Seu líquido real, claro, todo dia',
    'Painel feito pra leitura de 30 segundos',
    'Pagou uma vez, é seu para sempre',
  ],
} as const

const steps = [
  {
    title: 'Garanta sua licença',
    text: 'Um pagamento único e o acesso vitalício cai no seu e-mail na hora. Sem assinatura, sem renovação.',
  },
  {
    title: 'Organize o essencial',
    text: 'Contas, cartões e categorias alinhados ao jeito que você realmente gasta e investe.',
  },
  {
    title: 'Acompanhe a evolução',
    text: 'Veja patrimônio, metas e movimentos num painel feito para leitura diária, pelo resto da vida.',
  },
] as const

/*
 * PLACEHOLDER — substituir por depoimentos reais de clientes antes do lançamento.
 * Não usar quotes fictícios em produção (publicidade enganosa).
 */
const testimonials = [
  {
    quote:
      'Em uma semana eu finalmente sabia meu patrimônio real. Parei de adivinhar e comecei a decidir.',
    name: 'Ana Martins',
    role: 'Designer · São Paulo',
  },
  {
    quote:
      'Paguei uma vez e pronto. Larguei três planilhas e duas assinaturas. Só isso já valeu o preço.',
    name: 'Rafael Souza',
    role: 'Dev · Belo Horizonte',
  },
  {
    quote:
      'A meta da viagem saiu do papel. Ver o progresso todo dia mudou completamente minha relação com gastar.',
    name: 'Júlia Pereira',
    role: 'Empreendedora · Curitiba',
  },
] as const

const faqs = [
  {
    q: 'Vitalício é vitalício mesmo?',
    a: 'Sim. Você paga uma única vez e tem acesso ao MyCofre para sempre, incluindo as atualizações futuras. Sem mensalidade, sem renovação, sem cobrança surpresa.',
  },
  {
    q: 'Como recebo o acesso depois de pagar?',
    a: 'Na hora. Assim que o pagamento é confirmado pelo checkout, você recebe por e-mail os dados de acesso e já pode entrar e começar a organizar.',
  },
  {
    q: 'Tem alguma mensalidade ou cobrança recorrente?',
    a: 'Nenhuma. O valor da oferta é um pagamento único. Depois dele, você nunca mais paga nada para usar o MyCofre.',
  },
  {
    q: 'E se eu não gostar?',
    a: `Você tem ${OFFER.guaranteeDays} dias de garantia. Se não for para você, pede o reembolso e devolvemos 100% do valor, sem perguntas, sem burocracia.`,
  },
  {
    q: 'Preciso conectar meu banco?',
    a: 'Não. Você pode lançar contas e movimentos manualmente e ter a visão completa do seu patrimônio sem conectar nenhuma instituição.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Seus dados trafegam criptografados e nunca são vendidos. Você é dono das suas informações e pode exportá-las ou apagá-las quando quiser.',
  },
] as const

/**
 * Count-up para o número-herói (R$ patrimônio). Momento de deleite no primeiro
 * load — easing easeOutCubic, ~1,1s. Respeita prefers-reduced-motion e usa rAF.
 */
function useCountUp(target: number, durationMs = 1100) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setValue(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(target * easeOutCubic(p)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}

const Check = () => (
  <svg className="check" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 12.5l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const fmt = (n: number) => n.toLocaleString('pt-BR')

/**
 * Autoplay confiável: o React seta `muted` como propriedade mas não como
 * atributo no DOM, e a política de autoplay de alguns browsers bloqueia o
 * play — o vídeo fica congelado no primeiro frame. Forçar muted + play()
 * no ref resolve; os retries em `canplay` e `visibilitychange` cobrem
 * carregamento tardio e abas que voltam a ficar visíveis.
 */
const autoplayVideo = (el: HTMLVideoElement | null) => {
  if (!el || el.dataset.autoplayBound) return
  el.dataset.autoplayBound = '1'
  el.muted = true
  const tryPlay = () => {
    if (el.isConnected && el.paused) el.play().catch(() => {})
  }
  tryPlay()
  el.addEventListener('canplay', tryPlay, { once: true })
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay()
  })
}

/** Badge de escassez — vagas restantes da oferta de lançamento. */
function ScarcityBadge({ remaining, total }: { remaining: number; total: number }) {
  const sold = Math.max(0, total - remaining)
  const pct = Math.min(100, Math.round((sold / total) * 100))
  const low = remaining <= 20
  return (
    <div className={`scarcity${low ? ' scarcity--low' : ''}`} role="status" aria-live="polite">
      <div className="scarcity__row">
        <span className="scarcity__label">
          {low ? 'Últimas vagas!' : 'Vagas restantes'}
        </span>
        <span className="scarcity__count">
          <strong>{remaining}</strong> de {total} restantes
        </span>
      </div>
      <div
        className="scarcity__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Vagas já preenchidas"
      >
        <span className="scarcity__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Selo de garantia — reversão de risco. */
function GuaranteeSeal({ days }: { days: number }) {
  return (
    <p className="guarantee">
      <span className="guarantee__seal" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l7 3v5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>
        <strong>{days} dias de garantia.</strong> Não gostou, devolvemos 100%, risco zero.
      </span>
    </p>
  )
}

function App() {
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const netWorth = useCountUp(47210)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.feat-anim').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!navOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNavOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [navOpen])

  const closeNav = () => setNavOpen(false)

  return (
    <div className="shell">
      {/* Camada cinematográfica: glows que derivam lentamente + vinheta de filme */}
      <div className="cine-backdrop" aria-hidden>
        <span />
        <span />
      </div>
      <a className="skip" href="#conteudo">
        Ir para o conteúdo
      </a>

      <header
        className={`nav${navOpen ? ' nav--open' : ''}${scrolled ? ' nav--scrolled' : ''}`}
        role="banner"
      >
        <div className="nav__inner">
          <a className="brand" href="/" aria-label="MyCofre, início">
            <span className="brand__mark" aria-hidden>
              M
            </span>
            <span>MyCofre</span>
          </a>
          <nav className="nav__links" aria-label="Seções">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#oferta">Oferta</a>
            <a href="#perguntas">Perguntas</a>
          </nav>
          <div className="nav__cta">
            <a className="btn btn--primary btn--sm" href={CHECKOUT_URL}>
              Garantir acesso
            </a>
            <button
              className="nav__hamburger"
              aria-label={navOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={navOpen}
              aria-controls="nav-mobile"
              onClick={() => setNavOpen((v) => !v)}
            >
              <span aria-hidden />
              <span aria-hidden />
              <span aria-hidden />
            </button>
          </div>
        </div>
        <nav
          id="nav-mobile"
          className="nav__mobile"
          aria-label="Menu mobile"
          aria-hidden={!navOpen}
        >
          <a href="#recursos" onClick={closeNav}>Recursos</a>
          <a href="#como-funciona" onClick={closeNav}>Como funciona</a>
          <a href="#oferta" onClick={closeNav}>Oferta</a>
          <a href="#perguntas" onClick={closeNav}>Perguntas</a>
          <a className="btn btn--primary" href={CHECKOUT_URL} onClick={closeNav}>
            Garantir acesso vitalício
          </a>
        </nav>
      </header>

      <div id="conteudo" className="body-wrap">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__content">
            <p className="hero__eyebrow reveal-hero">
              <span aria-hidden />
              Oferta de lançamento · Acesso vitalício
            </p>
            <h1 id="hero-title" className="hero__title reveal-hero reveal-hero--2">
              Seu <em>patrimônio</em>, com clareza de cofre.
            </h1>
            <p className="hero__lede reveal-hero reveal-hero--3">
              Organize sua vida financeira, enxergue o líquido de verdade e decida melhor.
              Você paga <strong>uma única vez</strong> e usa o MyCofre <strong>para sempre</strong>.
              Sem mensalidade.
            </p>
            <div className="hero__actions reveal-hero reveal-hero--4">
              <a className="btn btn--primary" href={CHECKOUT_URL}>
                Quero acesso vitalício
              </a>
              <a className="btn btn--ghost" href="#oferta">
                Ver a oferta
              </a>
            </div>
            <p className="hero__note">
              Pagamento único de <strong>R$ {fmt(OFFER.price)}</strong> · {OFFER.guaranteeDays} dias
              de garantia · Sem mensalidade, para sempre.
            </p>
            <p className="hero__scarcity reveal-hero reveal-hero--5">
              <span className="pulse-dot" aria-hidden />
              Restam {OFFER.remainingSeats} das {OFFER.totalSeats} vagas desta oferta
            </p>
          </div>

          <div className="reveal-mock hero__visual" aria-hidden>
            <div className="hero__scene">
              <figure className="hero__loop" aria-hidden>
                <video
                  ref={autoplayVideo}
                  className="hero__loop-media"
                  src={BRAND_VIDEOS.heroLoop}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
                <figcaption className="hero__loop-badge">o cofre em movimento</figcaption>
              </figure>
              <div className="hero__mascot" aria-hidden>
                <img
                  className="mascot mascot--hero"
                  src={MASCOT.hero}
                  alt=""
                  aria-hidden
                  width={400}
                  height={400}
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              <div className="mock mock--hero">
                <div className="mock__glow" />
                <div className="mock__bar">
                  <span className="mock__app">MyCofre</span>
                  <span className="mock__label">Hoje</span>
                </div>
                <div>
                  <div className="mock__row">
                    <span className="mock__net">Patrimônio líquido</span>
                  </div>
                  <p className="mock__value">
                    <span className="mock__value-currency">R$ </span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {netWorth.toLocaleString('pt-BR')}
                    </span>
                  </p>
                  <span className="mock__trend">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M4 16l5-5 3 3 4-4 4 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M16 8h4v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    +3,2% no mês
                  </span>
                  <div className="mock__grid">
                    <div className="mock__tile">
                      Contas &amp; caixa
                      <strong>R$ 22.4k</strong>
                    </div>
                    <div className="mock__tile">
                      Metas
                      <strong>68% da viagem</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ul className="trust-bar" aria-label="Por que confiar no MyCofre">
          {trustItems.map((item) => (
            <li key={item} className="trust-bar__item">
              <Check />
              {item}
            </li>
          ))}
        </ul>

        <section className="section problem" id="problema" aria-labelledby="prob-head">
          <div className="section__head feat-anim">
            <p className="section__label">O problema</p>
            <h2 id="prob-head">Você reconhece esse cenário?</h2>
            <p className="section__lede">
              A maioria das pessoas não tem um problema de dinheiro, tem um problema de visão. Falta
              um lugar só onde tudo faz sentido.
            </p>
          </div>
          <div className="pains">
            {painPoints.map((pain) => (
              <article key={pain.title} className="pain feat-anim">
                <span className="pain__mark" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <h3>{pain.title}</h3>
                <p>{pain.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section beforeafter" id="a-virada" aria-labelledby="ba-head">
          <div className="section__head feat-anim">
            <p className="section__label">A virada</p>
            <h2 id="ba-head">Do caos financeiro à clareza de cofre.</h2>
            <p className="section__lede">
              A mesma vida financeira, organizada. Veja o que muda quando tudo passa a viver num
              lugar só.
            </p>
          </div>
          <div className="ba">
            <article className="ba__col ba__col--before">
              <p className="ba__tag">Antes</p>
              <ul>
                {beforeAfter.before.map((item) => (
                  <li key={item}>
                    <span className="ba__x" aria-hidden>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <div className="ba__arrow" aria-hidden>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <article className="ba__col ba__col--after">
              <p className="ba__tag">Depois</p>
              <ul>
                {beforeAfter.after.map((item) => (
                  <li key={item}>
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="section" id="recursos" aria-labelledby="rec-head">
          <div className="section__head feat-anim">
            <p className="section__label">Recursos</p>
            <h2 id="rec-head">Pensado para o dia a dia e para a sua visão de longo prazo.</h2>
            <p className="section__lede">
              Tudo o que importa, sem distração: o cofre reúne o mapa, o número e o próximo passo.
            </p>
          </div>
          <div className="features">
            {benefits.map((feature) => (
              <article
                key={feature.key}
                className={`feat feat-anim ${'variant' in feature && feature.variant === 'b' ? 'feat--b' : ''}`}
              >
                <div className="feat__icon" aria-hidden>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="como-funciona" aria-labelledby="how-head">
          <div className="section__head feat-anim">
            <p className="section__label">Como funciona</p>
            <h2 id="how-head">Do pagamento ao controle, em poucos minutos.</h2>
            <p className="section__lede">
              Menos atrito no caixa do dia a dia, mais alinhamento com o patrimônio que você está
              construindo.
            </p>
          </div>
          <div className="steps-block feat-anim">
            <ol className="steps">
              {steps.map((step, i) => (
                <li key={step.title} className="step" id={i === 0 ? 'passo-1' : undefined}>
                  <div className="step__n" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="steps-block__aside">
              <figure className="steps-showcase feat-anim">
                <video
                  ref={autoplayVideo}
                  className="steps-showcase__video"
                  src={BRAND_VIDEOS.stepsLoop}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
                <figcaption className="steps-showcase__caption">
                  <span>Sem mensalidade. Sem peso visual.</span>
                  <strong>O cofre entra em cena como lembrete de leveza, não de pressão.</strong>
                </figcaption>
              </figure>
              <aside className="steps-cta" aria-label="Garantir acesso">
                <p className="steps-cta__title">Pronto para ter o seu cofre para sempre?</p>
                <p className="steps-cta__text">
                  Um pagamento único e o acesso é seu, sem mensalidade, com {OFFER.guaranteeDays}{' '}
                  dias de garantia.
                </p>
                <a className="btn btn--primary" href={CHECKOUT_URL}>
                  Garantir minha licença
                </a>
              </aside>
            </div>
          </div>
        </section>

        <section className="section quotes" id="depoimentos" aria-labelledby="dep-head">
          <div className="section__head feat-anim">
            <p className="section__label">Depoimentos</p>
            <h2 id="dep-head">Quem organiza no cofre não volta para a planilha.</h2>
          </div>
          <div className="quotes__grid">
            {testimonials.map((t) => (
              <figure key={t.name} className="quote feat-anim">
                <span className="quote__stars" aria-hidden>
                  ★★★★★
                </span>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <span className="quote__avatar" aria-hidden>
                    {t.name.charAt(0)}
                  </span>
                  <span className="quote__person">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="section offer" id="oferta" aria-labelledby="offer-head">
          <div className="section__head offer__head feat-anim">
            <p className="section__label">Oferta de lançamento</p>
            <h2 id="offer-head">
              Pague uma vez. Use <em className="hand">para sempre</em>.
            </h2>
            <p className="section__lede">
              Sem mensalidade, sem renovação, sem pegadinha. Uma licença vitalícia do MyCofre por um
              preço de lançamento, enquanto durarem as vagas.
            </p>
          </div>

          <div className="offer__card feat-anim">
            <div className="offer__main">
              <div className="offer__namerow">
                <p className="offer__name">{OFFER.name} MyCofre</p>
                <span className="offer__tag">Melhor valor</span>
              </div>
              <p className="offer__anchor">
                A maioria dos apps cobra R$ {fmt(OFFER.anchorMonthly)} por mês, todo mês, para sempre.
              </p>
              <p className="offer__price">
                <span className="offer__currency">R$</span>
                <span className="offer__amount">{fmt(OFFER.price)}</span>
                <span className="offer__once">
                  uma única vez
                  <small>acesso vitalício</small>
                </span>
              </p>
              <p className="offer__equiv">
                Equivale a <strong>{breakEvenMonths} meses</strong> de mensalidade. Depois disso,
                cada ano é de graça.
              </p>

              <ScarcityBadge remaining={OFFER.remainingSeats} total={OFFER.totalSeats} />

              <a className="btn btn--primary offer__cta" href={CHECKOUT_URL}>
                Garantir minha licença vitalícia
              </a>

              <GuaranteeSeal days={OFFER.guaranteeDays} />
            </div>

            <ul className="offer__features" aria-label="O que está incluído">
              {offerIncludes.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section faq" id="perguntas" aria-labelledby="faq-head">
          <div className="section__head feat-anim">
            <p className="section__label">Perguntas frequentes</p>
            <h2 id="faq-head">Ainda em dúvida? A gente resolve.</h2>
          </div>
          <div className="faq__list">
            {faqs.map((item) => (
              <details key={item.q} className="faq__item">
                <summary>
                  {item.q}
                  <span className="faq__icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta" aria-labelledby="cta-end">
          <img
            className="cta__mascot"
            src={MASCOT.cta}
            alt=""
            aria-hidden
            width={280}
            height={280}
            decoding="async"
            loading="lazy"
          />
          <div className="cta__inner">
            <h2 id="cta-end">
              Garanta seu acesso <em className="hand">vitalício</em> antes das vagas acabarem.
            </h2>
            <p className="cta__lead">
              Um pagamento único de <strong>R$ {fmt(OFFER.price)}</strong> e o MyCofre é seu para
              sempre. Sem mensalidade, com {OFFER.guaranteeDays} dias de garantia.
            </p>
            <a className="btn btn--primary cta__btn" href={CHECKOUT_URL}>
              Quero meu acesso vitalício
            </a>
            <p className="cta__sub">
              Restam {OFFER.remainingSeats} de {OFFER.totalSeats} vagas da oferta de lançamento.
            </p>
          </div>
        </section>

        <footer className="footer" role="contentinfo">
          <p>© {new Date().getFullYear()} MyCofre. Todos os direitos reservados.</p>
          <div className="footer__meta">
            <a href="#recursos">Recursos</a>
            <a href="#oferta">Oferta</a>
            <a href={APP_URL}>Acessar app</a>
            <a href={`${APP_URL}/privacidade`}>Privacidade</a>
            <a href={`${APP_URL}/termos`}>Termos</a>
          </div>
        </footer>
      </div>

      {/* CTA fixo no mobile — botão de compra sempre à mão */}
      <div className="mobile-cta" aria-label="Comprar licença vitalícia">
        <div className="mobile-cta__info">
          <span className="mobile-cta__price">
            R$ {fmt(OFFER.price)} <small>uma vez</small>
          </span>
          <span className="mobile-cta__note">Acesso vitalício</span>
        </div>
        <a className="btn btn--primary" href={CHECKOUT_URL}>
          Garantir
        </a>
      </div>
    </div>
  )
}

export default App
