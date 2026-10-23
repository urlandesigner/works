"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { content } from "@/content";

/**
 * EXPERIMENTO VISUAL — dark premium sobre o MESMO produto (Bodum Chambord).
 *
 * Não substitui a LP de conversão em `/`. É um laboratório de estética
 * (dark mode, bento grid, gradiente índigo→violeta, Framer Motion) que
 * reaproveita o conteúdo real de `content.ts` — nenhuma copy inventada.
 *
 * Regra preservada da LP original: um único destino de clique
 * (content.product.checkoutUrl), link de afiliado com rel="sponsored".
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Entrada por scroll: fade-in + slide-up, uma vez, respeitando reduced-motion. */
function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** O único CTA: gradiente radiante, glow, link de afiliado. */
function RadiantCTA({
  label,
  reassurance,
  full = false,
}: {
  label: string;
  reassurance?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "w-full sm:w-auto" : "inline-block"}>
      <a
        href={content.product.checkoutUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={[
          "group relative inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full",
          "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-8 py-4",
          "text-lg font-semibold text-white",
          "shadow-[0_0_30px_-6px_rgba(139,92,246,0.7)] transition-all duration-300",
          "hover:shadow-[0_0_44px_-4px_rgba(139,92,246,0.9)] hover:brightness-110",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
          full ? "w-full sm:w-auto" : "",
        ].join(" ")}
      >
        {label}
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </a>
      {reassurance && (
        <p className="mt-3 text-sm text-zinc-500">{reassurance}</p>
      )}
    </div>
  );
}

export function ExperimentoContent() {
  const {
    hero,
    proofBar,
    verdict,
    analysis,
    comparison,
    pricing,
    faq,
    finalCta,
    affiliateDisclosure,
  } = content;

  // Destaca as últimas 3 palavras da headline com o gradiente da marca.
  const words = hero.headline.split(" ");
  const headHead = words.slice(0, -3).join(" ");
  const headTail = words.slice(-3).join(" ");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] font-[family-name:var(--font-inter)] text-zinc-100 antialiased">
      {/* Glows de fundo — gradientes sutis índigo/violeta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute top-[40%] -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* ───────────── HERO ───────────── */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Análise real · 6 meses de uso
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {headHead}{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {headTail}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
              {hero.subheadline}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10">
              <RadiantCTA
                label={hero.ctaLabel}
                reassurance={hero.ctaReassurance}
                full
              />
            </div>
          </Reveal>

          {/* Cards de credibilidade "flutuantes" — métricas reais do proofBar */}
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {proofBar.items.map((item, i) => (
              <FloatingStat key={item} label={item} index={i} />
            ))}
          </div>
        </section>

        {/* ───────────── BENTO GRID — o que 6 meses mostraram ───────────── */}
        <section className="py-16 sm:py-24">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {analysis.title}
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
              {analysis.intro}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {analysis.points.map((point, i) => {
              // Ritmo bento: cards 0 e 3 ocupam 2 colunas; 1 e 2 uma coluna.
              const wide = i === 0 || i === 3;
              return (
                <Reveal
                  key={point.benefit}
                  delay={i * 0.08}
                  className={wide ? "md:col-span-2" : "md:col-span-1"}
                >
                  <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.05]">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-sm font-semibold text-violet-200 ring-1 ring-white/10">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-zinc-100">
                      {point.benefit}
                    </h3>
                    <p className="mt-3 leading-relaxed text-zinc-400">
                      {point.evidence}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ───────────── VEREDITO — vale / não vale ───────────── */}
        <section className="py-16 sm:py-24">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {verdict.title}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8">
                <h3 className="text-lg font-semibold text-emerald-300">
                  Vale se você…
                </h3>
                <ul className="mt-5 space-y-4">
                  {verdict.forWhom.map((item) => (
                    <li key={item} className="flex gap-3 text-zinc-300">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 text-emerald-400"
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/[0.02] p-8">
                <h3 className="text-lg font-semibold text-zinc-400">
                  Não vale se você…
                </h3>
                <ul className="mt-5 space-y-4">
                  {verdict.notForWhom.map((item) => (
                    <li key={item} className="flex gap-3 text-zinc-400">
                      <span aria-hidden="true" className="mt-0.5 text-zinc-600">
                        ✕
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────────── COMPARAÇÃO ───────────── */}
        {comparison && (
          <section className="py-16 sm:py-24">
            <Reveal>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {comparison.title}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-12 overflow-hidden rounded-3xl border border-white/10">
                <table className="w-full border-collapse text-left text-sm sm:text-base">
                  <thead>
                    <tr className="bg-white/[0.04]">
                      <th className="p-5 font-medium text-zinc-500">Critério</th>
                      <th className="p-5 font-semibold text-violet-300">
                        {content.product.shortName}
                      </th>
                      <th className="p-5 font-medium text-zinc-400">
                        {comparison.alternativeName}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.rows.map((row) => (
                      <tr
                        key={row.criterion}
                        className="border-t border-white/[0.06]"
                      >
                        <td className="p-5 font-medium text-zinc-300">
                          {row.criterion}
                        </td>
                        <td className="p-5 text-zinc-300">{row.product}</td>
                        <td className="p-5 text-zinc-500">{row.alternative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </section>
        )}

        {/* ───────────── PREÇO ───────────── */}
        <section className="py-16 sm:py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 sm:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px]"
              />
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {pricing.title}
              </h2>
              <p className="mt-6 bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
                {pricing.price}
              </p>
              <p className="mt-3 max-w-xl text-sm text-zinc-500">
                {pricing.priceNote}
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {pricing.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-zinc-300">
                    <span aria-hidden="true" className="text-violet-400">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <RadiantCTA
                  label={hero.ctaLabel}
                  reassurance={hero.ctaReassurance}
                  full
                />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ───────────── FAQ ───────────── */}
        <section className="py-16 sm:py-24">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Perguntas frequentes
            </h2>
          </Reveal>
          <div className="mx-auto mt-12 max-w-3xl divide-y divide-white/10">
            {faq.map((item, i) => (
              <Reveal key={item.question} delay={i * 0.04}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-medium text-zinc-200 transition-colors hover:text-white">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="text-violet-400 transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────── CTA FINAL RADIANTE ───────────── */}
        <section className="pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-fuchsia-600/20 px-6 py-16 text-center sm:px-12 sm:py-20">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.35),transparent_60%)]"
              />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                  {finalCta.title}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-300">
                  {finalCta.subtitle}
                </p>
                <div className="mt-10 flex justify-center">
                  <RadiantCTA
                    label={hero.ctaLabel}
                    reassurance={hero.ctaReassurance}
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Divulgação de afiliado — obrigatória por lei, sempre visível */}
          <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-zinc-600">
            <span className="font-medium text-zinc-500">
              {affiliateDisclosure.label}{" "}
            </span>
            {affiliateDisclosure.text}
          </p>
        </section>
      </div>
    </div>
  );
}

/** Card de métrica com flutuação contínua sutil (o "flutuante" do brief). */
function FloatingStat({ label, index }: { label: string; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{
          duration: 5 + index,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur"
      >
        <p className="text-base font-medium text-zinc-200">{label}</p>
      </motion.div>
    </motion.div>
  );
}
