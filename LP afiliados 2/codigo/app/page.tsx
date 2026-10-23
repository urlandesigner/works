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
    verdict,
    analysis,
    testimonials,
    testimonialsTitle,
    comparison,
    guaranteeStrip,
    pricing,
    faq,
    faqTitle,
    finalCta,
  } = content;

  return (
    <main className="flex-1">
      {topBar && <TopBar text={topBar.text} />}

      {/* 1. HERO — valor em ~5s: headline (message match) + resultado + CTA + prova */}
      <section className="tone-light">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
              {hero.headline}
            </h1>
            <p className="mt-4 text-lg text-body">{hero.subheadline}</p>

            {/* id observado pelo StickyMobileCTA: o sticky só aparece
                depois que este CTA sai da tela. */}
            <div id="hero-cta" className="mt-8">
              <CTAButton
                label={hero.ctaLabel}
                reassurance={hero.ctaReassurance}
                variant="full"
              />
            </div>

            {/* Sem div em volta: o ProofBar carrega a própria margem, então
                lista vazia não deixa buraco no hero. */}
            <ProofBar items={proofBar.items} badgeImage={proofBar.badgeImage} />
          </div>

          {/* Mostra o RESULTADO, não print do produto.
              priority: é o LCP. Sem otimização automática (export
              estático) — comprimir à mão, alvo < 200 KB. */}
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            width={hero.image.width}
            height={hero.image.height}
            priority
            className="h-auto w-full rounded-xl"
          />
        </div>
      </section>

      {/* 2. VEREDITO — dizer para quem NÃO serve compra credibilidade */}
      <SectionShell title={verdict.title} tone="dark">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold text-heading">
              {verdict.forWhomTitle}
            </h3>
            <ul className="space-y-2 text-body">
              {verdict.forWhom.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-heading">
              {verdict.notForWhomTitle}
            </h3>
            <ul className="space-y-2 text-body">
              {verdict.notForWhom.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-muted">
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>

      {/* 3. ANÁLISE — SEÇÃO ESTRUTURAL. É o conteúdo original que evita
          reprovação por bridge page no Google Ads. Nunca remover.
          Fica em tom claro de propósito: é o trecho mais longo de leitura
          da página. */}
      <SectionShell title={analysis.title} tone="light">
        <p className="mb-8 text-lg text-body">{analysis.intro}</p>
        <div className="space-y-8">
          {analysis.points.map((point) => (
            <div
              key={point.benefit}
              className={
                point.image
                  ? "grid gap-5 sm:grid-cols-[96px_1fr] sm:items-start"
                  : undefined
              }
            >
              {point.image && (
                <Image
                  src={point.image.src}
                  alt={point.image.alt}
                  width={point.image.width}
                  height={point.image.height}
                  loading="lazy"
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}
              <div>
                {/* text-lg: o benefício precisa ser MAIOR que a evidência,
                    não só mais pesado. Em 16px/600 contra 16px/400 os dois
                    liam como um bloco só — e esta é a seção mais longa da
                    página (quase o dobro das outras), então quem escaneia
                    precisa captar os benefícios sem ler as evidências. */}
                <h3 className="text-lg font-semibold text-heading">
                  {point.benefit}
                </h3>
                <p className="mt-2 text-body">{point.evidence}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <CTAButton label={hero.ctaLabel} reassurance={hero.ctaReassurance} />
        </div>
      </SectionShell>

      {/* 4. PROVA SOCIAL — opcional: sem depoimentos, a seção some */}
      {testimonials.length > 0 && (
        <SectionShell title={testimonialsTitle} tone="dark">
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t) => (
              <TestimonialCard key={t.author} {...t} />
            ))}
          </div>
        </SectionShell>
      )}

      {/* 5. COMPARAÇÃO — opcional */}
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

      {/* Faixa dourada — divisor de alto impacto antes da zona de decisão,
          com o argumento de confiança mais forte (garantia). Opcional. */}
      {guaranteeStrip && (
        <SectionShell tone="gold" compact>
          <p className="text-center font-semibold text-heading">
            {guaranteeStrip.text}
          </p>
        </SectionShell>
      )}

      {/* 6. PREÇO — expectativa alinhada antes do clique reduz abandono */}
      <SectionShell title={pricing.title} tone="dark">
        <p className="text-3xl font-bold text-heading">{pricing.price}</p>
        <p className="mt-2 text-sm text-muted">{pricing.priceNote}</p>
        <ul className="mt-6 space-y-2 text-body">
          {pricing.includes.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-accent">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <CTAButton label={hero.ctaLabel} reassurance={hero.ctaReassurance} />
        </div>
      </SectionShell>

      {/* 7. FAQ — objeções reais: frete, garantia, devolução, prazo */}
      <SectionShell title={faqTitle} tone="light">
        <div>
          {faq.map((item) => (
            <FAQItem key={item.question} {...item} />
          ))}
        </div>
      </SectionShell>

      {/* 8. CTA FINAL + divulgação de afiliado */}
      <SectionShell tone="dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            {finalCta.title}
          </h2>
          <p className="mt-3 text-body">{finalCta.subtitle}</p>
          {/* id observado pelo StickyMobileCTA: com o CTA final na tela,
              o sticky some — senão ficariam dois botões iguais empilhados. */}
          <div id="final-cta" className="mt-8 flex justify-center">
            <CTAButton
              label={hero.ctaLabel}
              reassurance={hero.ctaReassurance}
            />
          </div>
        </div>
        <div className="mt-12">
          <AffiliateDisclosure />
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
  );
}
