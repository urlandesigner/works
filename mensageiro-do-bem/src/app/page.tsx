import type { Metadata } from "next";
import Script from "next/script";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PrimaryCta } from "@/components/landing/PrimaryCta";
import { SealedLetter } from "@/components/landing/SealedLetter";
import { StickyCta } from "@/components/landing/StickyCta";
import { OFFICIAL_SITE_URL } from "@/constants/messages";
import {
  LANDING_STEPS,
  LANDING_STEPS_INTRO,
  LANDING_STEPS_TITLE,
  MESSAGE_TEASERS,
  MESSAGE_TEASERS_NOTE,
  MESSAGE_TEASERS_TITLE,
} from "@/constants/landing";

const HOME_TITLE = "Mensagens de carinho e apoio no momento certo";
const HOME_DESCRIPTION =
  "Receba uma mensagem inspiradora com acesso imediato, sem cadastro e por um valor simbólico. Um gesto simples que acolhe você e ainda ajuda quem precisa.";

const faqs = [
  {
    question: "Como funciona o Mensageiro do Bem?",
    answer:
      "Você faz uma contribuição simbólica, confirma o pagamento e recebe na hora uma mensagem curta, carinhosa e inspiradora.",
  },
  {
    question: "Preciso fazer cadastro para receber a mensagem?",
    answer:
      "Não. O processo foi pensado para ser rápido e simples, sem exigir cadastro antes de abrir a sua mensagem.",
  },
  {
    question: "O pagamento é somente por PIX?",
    answer:
      "A página de recebimento foi desenhada para liberar o acesso com PIX de forma prática e imediata.",
  },
  {
    question: "Parte do valor realmente vira ajuda?",
    answer:
      "Sim. A maior parte de cada contribuição é destinada a ajudar quem precisa, e uma parcela menor sustenta a operação do site.",
  },
];

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${OFFICIAL_SITE_URL}#webpage`,
      url: OFFICIAL_SITE_URL,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      inLanguage: "pt-BR",
      isPartOf: {
        "@id": `${OFFICIAL_SITE_URL}#website`,
      },
    },
    {
      "@type": "Service",
      "@id": `${OFFICIAL_SITE_URL}#service`,
      serviceType: "Mensagens inspiradoras com acesso imediato",
      name: "Mensageiro do Bem",
      description: HOME_DESCRIPTION,
      areaServed: "BR",
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: `${OFFICIAL_SITE_URL}receber`,
      },
      provider: {
        "@id": `${OFFICIAL_SITE_URL}#organization`,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${OFFICIAL_SITE_URL}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
  },
  twitter: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

const testimonials = [
  {
    quote:
      "Eu abri sem esperar nada e chorei na primeira linha. Parecia que a mensagem tinha me encontrado.",
    author: "Ana",
    age: "32 anos",
  },
  {
    quote:
      "Foi rápido, leve e veio exatamente no dia em que eu precisava respirar um pouco melhor.",
    author: "Rafael",
    age: "28 anos",
  },
];

const trustBadges = [
  { icon: "coin", label: "A partir de R$1" },
  { icon: "bolt", label: "Acesso na hora" },
  { icon: "check", label: "Sem cadastro" },
  { icon: "heart", label: "Ajuda real" },
];

function BadgeIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4",
    "aria-hidden": true,
  };
  switch (name) {
    case "coin":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v9M9.5 9.5h3.25a1.75 1.75 0 0 1 0 3.5H9.5h3.5a1.75 1.75 0 0 1 0 3.5H9.5" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 12 2.5 2.5 4.5-5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 20.5S4 14.7 4 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8 2.8c0 5.5-8 11.3-8 11.3Z" />
        </svg>
      );
  }
}

function RepeatedCta({ className = "" }: { className?: string }) {
  return (
    <div className={`mt-10 flex justify-center sm:mt-12 ${className}`}>
      <PrimaryCta href="/receber" className="w-full sm:min-w-[18rem]">
        Quero receber minha mensagem
      </PrimaryCta>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-full">
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <main>
        {/* HERO */}
        <header className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 md:pb-28 md:pt-24">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--glow-1)] blur-3xl opacity-80 sm:h-96 sm:w-96"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-6 right-[-4rem] h-64 w-64 rounded-full bg-[var(--glow-2)] blur-3xl opacity-45 sm:h-80 sm:w-80"
            aria-hidden
          />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--paper)]/70 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)] opacity-0 shadow-sm backdrop-blur-sm [animation-delay:40ms] [animation-fill-mode:forwards]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
              Uma pausa de carinho no seu dia
            </span>

            <SealedLetter className="animate-fade-up mt-16 opacity-0 [animation-delay:120ms] [animation-fill-mode:forwards] sm:mt-14" />

            <h1 className="animate-fade-up mt-9 max-w-4xl font-serif text-[2.7rem] font-semibold leading-[0.97] tracking-[-0.04em] text-[var(--ink)] opacity-0 [animation-delay:220ms] [animation-fill-mode:forwards] sm:text-[4rem] md:text-[4.7rem]">
              Receba uma mensagem que chega bem na hora em que{" "}
              <span className="italic text-[var(--accent-mid)]">você precisava.</span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] opacity-0 [animation-delay:320ms] [animation-fill-mode:forwards] sm:text-lg sm:leading-8">
              Um gesto simples, delicado e direto ao coração. Abra a sua em
              poucos segundos.
            </p>

            <div className="animate-fade-up w-full opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
              <RepeatedCta className="w-full" />
            </div>
            <p className="animate-fade-up mt-4 max-w-md text-sm leading-6 text-[var(--muted)]/90 opacity-0 [animation-delay:480ms] [animation-fill-mode:forwards]">
              Leva menos de um minuto para receber. Sem complicação, sem texto
              demais.
            </p>

            {/* Faixa de confiança */}
            <ul className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 opacity-0 [animation-delay:560ms] [animation-fill-mode:forwards] sm:gap-x-7">
              {trustBadges.map((badge) => (
                <li
                  key={badge.label}
                  className="flex items-center gap-2 text-[0.8125rem] font-medium text-[var(--ink)]/80"
                >
                  <span className="text-[var(--accent-mid)]">
                    <BadgeIcon name={badge.icon} />
                  </span>
                  {badge.label}
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* INTRO EMOCIONAL — trecho de carta */}
        <section className="border-t border-[var(--stroke)] bg-[var(--paper-warm)]/70 px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <figure className="relative overflow-hidden rounded-[2rem] border border-[var(--paper-edge)] bg-gradient-to-b from-[var(--paper)] to-[var(--paper-warm)] px-7 py-10 text-left shadow-[var(--shadow-ticket),0_30px_60px_-34px_rgba(74,67,60,0.4)] sm:px-12 sm:py-14">
              {/* Filete lateral de cera, evocando a margem de uma carta */}
              <span
                className="pointer-events-none absolute inset-y-8 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#d6786c] via-[var(--accent)] to-transparent opacity-70 sm:inset-y-10"
                aria-hidden
              />

              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Querido você,
              </p>

              <blockquote className="mt-6 space-y-5">
                <p className="font-serif text-[1.85rem] font-medium leading-[1.12] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.65rem]">
                  Tem dias em que a gente só precisa de{" "}
                  <span className="italic text-[var(--accent-mid)]">
                    algumas palavras certas.
                  </span>
                </p>
                <p className="font-serif text-[1.2rem] leading-8 text-[var(--ink)]/75 sm:text-[1.45rem] sm:leading-9">
                  Uma lembrança de que ainda existe beleza, calma e cuidado
                  esperando por você. Essa mensagem chega assim: curta,
                  carinhosa e impossível de ignorar.
                </p>
              </blockquote>

              <figcaption className="mt-9 flex items-center gap-3">
                <span className="h-px w-9 bg-[var(--accent)]/45" aria-hidden />
                <span className="font-serif text-[1.05rem] italic text-[var(--muted)]">
                  e a sua já está sendo escolhida.
                </span>
              </figcaption>
            </figure>
            <RepeatedCta />
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {LANDING_STEPS_TITLE}
              </p>
              <h2 className="mt-4 font-serif text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-[2.6rem]">
                {LANDING_STEPS_INTRO}
              </h2>
            </div>

            <ol className="mt-12 grid gap-6 md:grid-cols-3 md:gap-5">
              {LANDING_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="relative rounded-[1.75rem] border border-[var(--stroke)] bg-[var(--paper)] px-6 py-8 text-center shadow-[var(--shadow-ticket)]"
                >
                  <span
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#d6786c] to-[var(--accent-mid)] font-sans text-lg font-bold text-[var(--accent-foreground)] [font-variant-numeric:lining-nums] shadow-[0_6px_16px_-6px_rgba(181,77,66,0.6)]"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-serif text-[1.4rem] font-semibold text-[var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2.5 max-w-xs text-[0.95rem] leading-7 text-[var(--muted)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* AMOSTRA DAS MENSAGENS */}
        <section className="border-y border-[var(--stroke)] bg-[linear-gradient(180deg,rgba(250,245,236,0.72)_0%,rgba(253,249,243,0.9)_100%)] px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Uma amostra do que chega
              </p>
              <h2 className="mt-4 font-serif text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-[2.6rem]">
                {MESSAGE_TEASERS_TITLE}
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {MESSAGE_TEASERS.map((teaser, i) => (
                <figure
                  key={teaser.text}
                  className="rounded-[1.5rem] border border-[var(--paper-edge)] bg-[var(--paper)] px-6 py-8 shadow-[var(--shadow-ticket)] md:[transform:rotate(var(--r))]"
                  style={
                    { "--r": `${[-1.5, 0.8, -0.6][i] ?? 0}deg` } as React.CSSProperties
                  }
                >
                  <span
                    className="block font-serif text-3xl leading-none text-[var(--accent)]/30"
                    aria-hidden
                  >
                    &ldquo;
                  </span>
                  <blockquote className="-mt-2 font-serif text-[1.2rem] leading-8 text-[var(--ink)]">
                    {teaser.text}
                  </blockquote>
                </figure>
              ))}
            </div>

            <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-6 text-[var(--muted)]">
              {MESSAGE_TEASERS_NOTE}
            </p>
            <RepeatedCta />
          </div>
        </section>

        {/* OFERTA R$1 — TICKET */}
        <section className="px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Oferta de entrada
            </p>
            <h2 className="mt-4 font-serif text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-[2.6rem]">
              Comece com um gesto pequeno.
            </h2>

            <div className="relative mt-9">
              {/* Recortes do ticket */}
              <div
                className="absolute left-[-12px] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--canvas)]"
                aria-hidden
              />
              <div
                className="absolute right-[-12px] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--canvas)]"
                aria-hidden
              />
              <div className="rounded-[2rem] border border-[var(--accent)]/18 bg-[var(--paper)] px-6 py-10 shadow-[var(--shadow-ticket)] sm:px-12">
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="font-sans text-2xl font-semibold text-[var(--accent-mid)]/70">
                    R$
                  </span>
                  <span className="font-sans text-[5rem] font-bold leading-none tracking-[-0.04em] text-[var(--accent-mid)] [font-variant-numeric:lining-nums_tabular-nums] sm:text-[6.5rem]">
                    1
                  </span>
                </div>
                <div
                  className="mx-auto my-6 h-px w-2/3 border-t border-dashed border-[var(--stroke-strong)]"
                  aria-hidden
                />
                <p className="text-lg leading-8 text-[var(--ink)] sm:text-[1.3rem]">
                  O suficiente para abrir sua primeira mensagem agora.
                </p>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  Valor simbólico, acesso imediato e uma experiência feita para
                  emocionar sem pesar no bolso.
                </p>
                <RepeatedCta />
              </div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className="border-t border-[var(--stroke)] bg-[var(--paper-warm)]/70 px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Quem recebeu sentiu
              </p>
              <h2 className="mt-4 font-serif text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-[2.6rem]">
                Pequena na forma, enorme no efeito.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.author}
                  className="rounded-[1.75rem] border border-[var(--stroke)] bg-[var(--paper)] px-6 py-7 shadow-[var(--shadow-ticket)] sm:px-8 sm:py-8"
                >
                  <p className="font-serif text-[1.2rem] leading-8 text-[var(--ink)] sm:text-[1.35rem] sm:leading-9">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] font-serif text-lg font-semibold text-[var(--accent-mid)]"
                      aria-hidden
                    >
                      {testimonial.author.charAt(0)}
                    </span>
                    <span className="text-sm font-medium text-[var(--muted)]">
                      {testimonial.author},{" "}
                      <span className="text-[var(--muted)]/80">{testimonial.age}</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* IMPACTO / TRANSPARÊNCIA */}
        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--stroke)] bg-[var(--paper)]/85 px-6 py-9 shadow-[var(--shadow-ticket)] sm:px-10 sm:py-11">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-mid)]"
                aria-hidden
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M12 20.5S4 14.7 4 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8 2.8c0 5.5-8 11.3-8 11.3Z" />
                </svg>
              </span>
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Para onde vai o seu gesto
                </p>
                <h2 className="font-serif text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-[1.9rem]">
                  A grande maioria vai para quem precisa.
                </h2>
              </div>
            </div>

            {/* Duas linhas com pesos visuais distintos — grande maioria x parte pequena */}
            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--accent-soft)] px-4 py-4 ring-1 ring-inset ring-[var(--accent)]/15">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#d6786c] to-[var(--accent-mid)] text-[var(--accent-foreground)]"
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 20.5S4 14.7 4 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8 2.8c0 5.5-8 11.3-8 11.3Z" />
                  </svg>
                </span>
                <p className="text-[0.95rem] leading-6 text-[var(--ink)]">
                  <span className="font-semibold text-[var(--accent-mid)]">
                    A grande maioria
                  </span>{" "}
                  é doada para ajudar quem precisa.
                </p>
              </div>
              <div className="flex items-center gap-3 px-4 py-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-[var(--paper-edge)]"
                  aria-hidden
                />
                <p className="text-[0.85rem] leading-6 text-[var(--muted)]">
                  Uma parte pequena mantém o site no ar.
                </p>
              </div>
            </div>

            <p className="mt-6 text-[0.95rem] leading-7 text-[var(--ink)]/85">
              É simples: a maior parte de cada contribuição vira ajuda real, e o
              pouco que sobra mantém esse cuidado de pé — para continuar chegando a
              mais gente.
            </p>
          </div>
        </section>

        <section className="border-t border-[var(--stroke)] bg-[var(--paper)] px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Perguntas frequentes
              </p>
              <h2 className="mt-4 font-serif text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-[2.6rem]">
                O que você pode querer saber antes de abrir a sua mensagem.
              </h2>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-[1.5rem] border border-[var(--stroke)] bg-[var(--paper-warm)]/50 px-6 py-5 shadow-[var(--shadow-ticket)]"
                >
                  <summary className="cursor-pointer list-none pr-8 font-serif text-[1.2rem] font-semibold leading-7 text-[var(--ink)] marker:hidden">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-[0.98rem] leading-7 text-[var(--muted)]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="border-t border-[var(--stroke)] bg-[var(--paper-warm)]/60 px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <SealedLetter size="sm" className="mb-2" />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Antes que o dia passe
            </p>
            <h2 className="mt-4 font-serif text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-[2.6rem]">
              Se essa mensagem pode fazer diferença hoje, não deixa para depois.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              Abra agora e veja o que chega para você neste exato momento.
            </p>
            <RepeatedCta />
          </div>
        </section>
      </main>
      <LandingFooter />
      <StickyCta />
    </div>
  );
}
