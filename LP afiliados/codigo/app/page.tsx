import Image from "next/image";
import { content } from "@/content";
import { CTAButton } from "@/components/CTAButton";
import { SectionShell } from "@/components/SectionShell";
import { ProofBar } from "@/components/ProofBar";
import { TestimonialCard } from "@/components/TestimonialCard";
import { FAQItem } from "@/components/FAQItem";
import { ComparisonTable } from "@/components/ComparisonTable";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { TopBar } from "@/components/TopBar";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * A página inteira num arquivo só, de propósito: reordenar seção é
 * mover um bloco, e teste A/B de ordem é o caso mais comum numa LP.
 *
 * Ordem definida em ../plano-template-lp.md. Seções opcionais somem
 * quando o conteúdo está vazio — estado normal, não erro.
 *
 * TOM: as seções alternam claro/escuro, ecoando o ritmo visual da página
 * oficial do produto (que alterna a cada seção, não só no fim). A faixa
 * dourada antes do preço também serve de amortecedor: se depoimentos ou
 * comparação estiverem ausentes, ela evita duas seções escuras coladas.
 *
 * Nenhuma cor fixa aqui dentro — só text-heading / text-body /
 * text-muted / text-accent, que o tom da seção resolve.
 */
export default function Page() {
  const {
    topBar,
    hero,
    proofBar,
    problem,
    verdict,
    howItWorks,
    endorsement,
    analysis,
    testimonials,
    testimonialsTitle,
    comparison,
    guaranteeStrip,
    pricing,
    faq,
    faqTitle,
    finalCta,
    healthDisclaimer,
  } = content;

  return (
    <>
      <main className="flex-1">
      <ScrollReveal />
      {topBar && <TopBar text={topBar.text} />}

      {/* 1. HERO — valor em ~5s: headline (message match) + resultado + CTA + prova.
          Tom ESCURO, ao contrário das versões anteriores: é a "capa" da
          revista. A entrada é escalonada (--rise-delay crescente), então
          o olho percorre headline → subtítulo → CTA → prova na ordem que
          a página quer ser lida, em vez de tudo aparecer de uma vez. */}
      <section className="tone-dark overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <p
              className="rise-in eyebrow mb-5 flex items-center gap-3 text-accent"
              style={{ "--rise-delay": "0s" } as React.CSSProperties}
            >
              Independent Analysis
              <span aria-hidden="true" className="h-px w-14 bg-accent/40" />
            </p>

            <h1
              className="rise-in font-display text-5xl text-heading uppercase sm:text-6xl lg:text-7xl"
              style={{ "--rise-delay": "0.08s" } as React.CSSProperties}
            >
              {hero.headline}
            </h1>

            <p
              className="rise-in mt-6 max-w-xl text-lg leading-relaxed text-body"
              style={{ "--rise-delay": "0.16s" } as React.CSSProperties}
            >
              {hero.subheadline}
            </p>

            {/* id observado pelo StickyMobileCTA: o sticky só aparece
                depois que este CTA sai da tela. */}
            <div
              id="hero-cta"
              className="rise-in mt-9"
              style={{ "--rise-delay": "0.24s" } as React.CSSProperties}
            >
              <CTAButton
                label={hero.ctaLabel}
                reassurance={hero.ctaReassurance}
                variant="full"
              />
            </div>

            {/* Sem div em volta: o ProofBar carrega a própria margem, então
                lista vazia não deixa buraco no hero. */}
            <div
              className="rise-in"
              style={{ "--rise-delay": "0.32s" } as React.CSSProperties}
            >
              <ProofBar items={proofBar.items} />
            </div>
          </div>

          {/* Mostra o RESULTADO, não print do produto.
              priority: é o LCP. Sem otimização automática (export
              estático) — comprimir à mão, alvo < 200 KB.
              O halo atrás do frasco é o que separa o produto do fundo
              escuro; sem ele a foto (que tem fundo claro de academia)
              flutuava como retângulo colado. */}
          <div
            className="rise-in relative"
            style={{ "--rise-delay": "0.14s" } as React.CSSProperties}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 scale-110 rounded-full bg-accent/20 blur-3xl"
            />
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              width={hero.image.width}
              height={hero.image.height}
              priority
              className="h-auto w-full rounded-2xl border border-line shadow-2xl"
            />

            {/* Selo flutuante: quebra a moldura retangular e sequestra o
                olho para a garantia — o argumento que mais derruba
                objeção nesta categoria. */}
            <div className="absolute -bottom-5 -left-3 rotate-[-4deg] rounded-lg bg-cta px-4 py-3 shadow-xl sm:-left-6">
              {/* text-dark, não text-white: o selo usa bg-cta (lima).
                  Branco sobre lima dá 1.15:1 — o número sumia. */}
              <p className="font-display text-2xl leading-none text-dark">60</p>
              <p className="eyebrow mt-1 text-[0.6rem] text-dark/80">
                Day Guarantee
              </p>
            </div>
          </div>
        </div>

        {/* Faixa de números — o rótulo real virado em dado escaneável.
            Fica no fim do hero de propósito: é a "dica visual" que
            motiva a rolar, contra o falso fim de página. */}
        <div className="border-t border-line">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-5 sm:grid-cols-4 sm:divide-x">
            {[
              { n: "3.5B", l: "CFU per tablet" },
              { n: "3", l: "Probiotic strains" },
              { n: "1", l: "Tablet per day" },
              { n: "60", l: "Day money-back" },
            ].map((stat, i) => (
              <div
                key={stat.l}
                className="rise-in px-2 py-6 text-center sm:py-8"
                style={
                  { "--rise-delay": `${0.4 + i * 0.07}s` } as React.CSSProperties
                }
              >
                <dt className="font-display text-4xl text-accent sm:text-5xl">
                  {stat.n}
                </dt>
                <dd className="mt-2 text-xs tracking-wide text-muted uppercase">
                  {stat.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 2. PROBLEMA — empatia antes de solução. Sem esta seção o
          visitante saía do hero direto para um filtro ("serve pra
          você?") sem nunca ver a própria frustração nomeada.
          Texto e imagem lado a lado: a ilustração anatômica explica o
          mecanismo mais rápido que o parágrafo que a acompanha. */}
      <SectionShell
        title={problem.title}
        eyebrow="01 — The Problem"
        tone="light"
        wide
      >
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div className="reveal space-y-5">
            {problem.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-relaxed text-body">
                {paragraph}
              </p>
            ))}
          </div>
          <Image
            src={problem.image.src}
            alt={problem.image.alt}
            width={problem.image.width}
            height={problem.image.height}
            loading="lazy"
            className="reveal h-auto w-full max-w-sm justify-self-center"
          />
        </div>
      </SectionShell>

      {/* 3. VEREDITO — dizer para quem NÃO serve compra credibilidade.
          Dois cards de peso IGUAL, lado a lado: se o "não serve"
          parecesse nota de rodapé, a honestidade viraria encenação. */}
      <SectionShell title={verdict.title} eyebrow="02 — Fit Check" tone="dark">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="reveal rounded-xl border border-line bg-surface p-6 shadow-sm">
            <h3 className="eyebrow mb-5 text-accent">{verdict.forWhomTitle}</h3>
            <ul className="space-y-4 text-body">
              {verdict.forWhom.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-xs text-accent"
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal rounded-xl border border-line bg-surface p-6 shadow-sm">
            <h3 className="eyebrow mb-5 text-muted">
              {verdict.notForWhomTitle}
            </h3>
            <ul className="space-y-4 text-body">
              {verdict.notForWhom.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/12 text-xs text-muted"
                  >
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>

      {/* 4. COMO FUNCIONA — 3 passos escaneáveis. Existe porque a
          análise logo abaixo é densa e 79% das pessoas escaneiam: este é
          o resumo que quem não lê tudo leva embora. */}
      <SectionShell
        title={howItWorks.title}
        eyebrow="03 — How It Works"
        tone="light"
        wide
      >
        <ol className="grid gap-6 sm:grid-cols-3">
          {howItWorks.steps.map((step, i) => (
            <li
              key={step.title}
              className="reveal rounded-xl border border-line bg-surface p-6 shadow-sm"
            >
              <span
                aria-hidden="true"
                className="font-display text-3xl leading-none text-accent"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-heading">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-body">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </SectionShell>

      {/* 5. ANÁLISE — SEÇÃO ESTRUTURAL. É o conteúdo original que evita
          reprovação por bridge page no Google Ads. Nunca remover.
          Fica em tom claro de propósito: é o trecho mais longo de leitura
          da página. */}
      <SectionShell
        title={analysis.title}
        eyebrow="04 — Ingredient Breakdown"
        tone="dark"
      >
        <p className="reveal mb-12 max-w-2xl text-lg leading-relaxed text-body">
          {analysis.intro}
        </p>

        {/* O rótulo real, ao lado da análise: é a prova que sustenta
            tudo que vem abaixo. Fica ANTES dos pontos de propósito —
            quem escaneia vê a fonte antes da leitura. */}
        {proofBar.badgeImage && (
          <figure className="reveal mb-12 overflow-hidden rounded-xl border border-line bg-surface">
            <Image
              src={proofBar.badgeImage.src}
              alt={proofBar.badgeImage.alt}
              width={proofBar.badgeImage.width}
              height={proofBar.badgeImage.height}
              loading="lazy"
              className="h-auto w-full"
            />
            <figcaption className="border-t border-line px-5 py-3 text-sm text-muted">
              The actual Supplement Facts panel — every figure discussed
              below comes from this label.
            </figcaption>
          </figure>
        )}

        {/* A peça de marketing do vendor, exibida como OBJETO DE ANÁLISE.
            A legenda vem antes da lista crítica de propósito: o visitante
            vê o que está sendo prometido e, logo abaixo, a ressalva de
            cada número. Sem a legenda isto seria eco de alegação — com
            ela, é o material que a seção examina. */}
        {analysis.vendorClaims && (
          <figure className="reveal mb-12 overflow-hidden rounded-xl border border-line bg-white">
            <Image
              src={analysis.vendorClaims.image.src}
              alt={analysis.vendorClaims.image.alt}
              width={analysis.vendorClaims.image.width}
              height={analysis.vendorClaims.image.height}
              loading="lazy"
              className="mx-auto h-auto w-full max-w-md"
            />
            <figcaption className="border-t border-line bg-surface px-5 py-4 text-sm leading-relaxed text-muted">
              {analysis.vendorClaims.caption}
            </figcaption>
          </figure>
        )}

        {/* Numeração em display grande + régua vertical: leitura de
            dossiê numerado. É o que permite escanear só os benefícios
            (esta é a seção mais longa da página) sem ler as evidências. */}
        <ol className="space-y-10">
          {analysis.points.map((point, i) => (
            <li
              key={point.benefit}
              className="reveal grid gap-x-5 gap-y-3 sm:grid-cols-[auto_1fr]"
            >
              <div
                aria-hidden="true"
                className="flex items-start gap-4 sm:flex-col sm:items-center"
              >
                <span className="font-display text-3xl leading-none text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 hidden w-px flex-1 bg-line sm:block" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-heading">
                  {point.benefit}
                </h3>
                <p className="mt-3 leading-relaxed text-body">
                  {point.evidence}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Endosso com a divulgação de pagamento IMEDIATAMENTE abaixo,
            no mesmo card. Separar os dois seria exatamente o que a FTC
            proíbe: exibir credencial e esconder o vínculo comercial. */}
        {endorsement && (
          <figure className="reveal mt-14 rounded-xl border-l-2 border-accent bg-surface/60 p-6 sm:p-8">
            <blockquote className="text-lg leading-relaxed text-body italic">
              &ldquo;{endorsement.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5">
              <p className="font-semibold text-heading">{endorsement.name}</p>
              <p className="mt-1 text-sm text-muted">
                {endorsement.credentials}
              </p>
              <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
                {endorsement.disclosure}
              </p>
            </figcaption>
          </figure>
        )}

        <div className="reveal mt-14">
          <CTAButton label={hero.ctaLabel} reassurance={hero.ctaReassurance} />
        </div>
      </SectionShell>

      {/* 6. PROVA SOCIAL — opcional: sem depoimentos, a seção some */}
      {testimonials.length > 0 && (
        <SectionShell title={testimonialsTitle} tone="light">
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t) => (
              <TestimonialCard key={t.author} {...t} />
            ))}
          </div>
        </SectionShell>
      )}

      {/* 7. COMPARAÇÃO — opcional */}
      {comparison && (
        <SectionShell title={comparison.title} tone="light">
          <ComparisonTable
            productName={content.product.name}
            productShortName={content.product.shortName}
            alternativeName={comparison.alternativeName}
            rows={comparison.rows}
          />
        </SectionShell>
      )}

      {/* Faixa azul — divisor de alto impacto antes da zona de decisão,
          com o argumento de confiança mais forte (garantia). Opcional. */}
      {guaranteeStrip && (
        <SectionShell tone="band" compact>
          <p className="font-display text-center text-2xl text-heading uppercase sm:text-3xl">
            {guaranteeStrip.text}
          </p>
        </SectionShell>
      )}

      {/* 8. PREÇO — expectativa alinhada antes do clique reduz abandono.
          Três cards com os pacotes REAIS do checkout: o visitante já
          chega ao destino sabendo o que vai encontrar, e o total de cada
          pacote fica à mostra (nada de "a partir de" escondendo o
          desembolso real). */}
      <SectionShell title={pricing.title} eyebrow="05 — What It Costs" tone="dark" wide>
        {/* items-stretch, não items-center: com foto no topo e altura de
            imagem fixa, os três cards passam a alinhar nome, quantidade e
            preço na mesma linha. Comparar preço vira leitura horizontal em
            vez de caça ao número. */}
        <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
          {pricing.tiers.map((tier) => (
            <div
              key={tier.name}
              className={[
                "reveal relative flex flex-col rounded-2xl border p-7 transition-transform duration-200",
                tier.highlight
                  ? // O destacado cresce e ganha borda de destaque: o
                    // contraste é o que faz a recomendação ser lida como
                    // recomendação. Só UM tier pode ter highlight.
                    "border-accent bg-surface shadow-[0_0_50px_-12px_rgb(90_172_232/0.45)] md:scale-105"
                  : "border-line bg-surface/60 hover:-translate-y-1",
              ].join(" ")}
            >
              {tier.badge && (
                <span className="eyebrow absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1.5 text-[0.65rem] whitespace-nowrap text-dark">
                  {tier.badge}
                </span>
              )}

              {/* Foto do pacote antes do texto: "6 frascos" lido como
                  quantidade, não como número.

                  Sobre PLACA BRANCA, e não recortada com fundo
                  transparente: as fotos oficiais têm frascos sangrando
                  para fora do quadro, o que sobre fundo branco lê como
                  enquadramento e sobre fundo escuro lê como corte
                  errado. A placa devolve o contexto original, elimina
                  franja de recorte e ainda dá um respiro claro no card.
                  Altura fixa nos três: nome, quantidade e preço passam a
                  alinhar entre os cards. */}
              {tier.image && (
                <div className="mb-6 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-white p-3">
                  <Image
                    src={tier.image.src}
                    alt={tier.image.alt}
                    width={tier.image.width}
                    height={tier.image.height}
                    loading="lazy"
                    className="h-full w-auto object-contain"
                  />
                </div>
              )}

              <h3 className="font-display text-2xl text-heading uppercase">
                {tier.name}
              </h3>
              <p className="mt-1 text-sm text-muted">{tier.supply}</p>

              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl text-accent">
                  {tier.unitPrice}
                </span>
                <span className="text-sm text-muted">{tier.unitLabel}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-body">
                {tier.total}
              </p>

              {tier.perks.length > 0 && (
                <ul className="mt-6 space-y-2.5 border-t border-line pt-6 text-sm text-body">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex gap-2.5">
                      <span aria-hidden="true" className="text-accent">
                        ✓
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Um CTA só, embaixo dos três — não um por card. A regra do
            CLAUDE.md é um CTA principal por página, e o destino é o
            mesmo nos três casos (a escolha do pacote acontece no
            checkout oficial). */}
        <div className="reveal mt-12 flex flex-col items-center text-center">
          <CTAButton label={hero.ctaLabel} reassurance={hero.ctaReassurance} />
          <p className="mt-6 max-w-2xl text-sm text-muted">
            {pricing.priceNote}
          </p>
        </div>
      </SectionShell>

      {/* 9. FAQ — objeções reais: segurança, prazo, devolução */}
      <SectionShell title={faqTitle} eyebrow="06 — Before You Buy" tone="light">
        <div className="reveal">
          {faq.map((item) => (
            <FAQItem key={item.question} {...item} />
          ))}
        </div>
      </SectionShell>

      {/* 10. CTA FINAL + divulgação de afiliado */}
      <SectionShell tone="dark">
        <div className="reveal text-center">
          <h2 className="font-display text-4xl text-heading uppercase sm:text-6xl">
            {finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-body">
            {finalCta.subtitle}
          </p>
          {/* id observado pelo StickyMobileCTA: com o CTA final na tela,
              o sticky some — senão ficariam dois botões iguais empilhados. */}
          <div id="final-cta" className="mt-10 flex justify-center">
            <CTAButton
              label={hero.ctaLabel}
              reassurance={hero.ctaReassurance}
            />
          </div>
        </div>
        {/* Divulgação de afiliado e aviso da FDA juntos, depois do CTA
            final: os dois são exigência legal (FTC e DSHEA) e nenhum
            deve ficar escondido. Ficam aqui, e não antes do botão, para
            não interromper a decisão — mas na mesma tela dela. */}
        <div className="mt-16 space-y-4 border-t border-line pt-8">
          <AffiliateDisclosure />
          {/* text-sm, não text-xs: a FTC exige divulgação "clear and
              conspicuous", e o público desta página tem 40+. Letra miúda
              de 12px é exatamente o que a regra proíbe. */}
          {healthDisclaimer && (
            <p className="text-sm leading-relaxed text-muted">
              {healthDisclaimer.text}
            </p>
          )}
        </div>
      </SectionShell>

      {/* Espaço para o sticky não cobrir a divulgação no mobile */}
      <div aria-hidden="true" className="h-20 sm:hidden" />

      <StickyMobileCTA
        href={content.product.checkoutUrl}
        label={hero.ctaLabel}
        showAfterId="hero-cta"
        hideWhenVisibleId="final-cta"
      />
      </main>

      {/* Fora do <main>: rodapé não é conteúdo principal. Ver o
          comentário do componente sobre por que estes três links são a
          exceção à regra "sem links que dispersem". */}
      <SiteFooter />
    </>
  );
}
