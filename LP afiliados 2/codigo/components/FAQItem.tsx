import type { FaqItem } from "@/content";

/**
 * <details> nativo: acordeão sem JS.
 * Funciona antes da hidratação, acessível por teclado de graça,
 * e o conteúdo fica no HTML — o que também serve para SEO.
 */
export function FAQItem({ question, answer }: FaqItem) {
  return (
    <details className="group border-b border-line">
      {/* O padding fica no <summary>, não no <details>: é o summary que
          recebe o toque. Com padding no pai, a área clicável cai para a
          altura do texto (24px) e quebra o mínimo de 48px no mobile. */}
      {/* focus-visible: sem isto o <summary> não mostra foco nenhum ao
          navegar por teclado (WCAG 2.4.7). O outline usa a cor de
          destaque do tom atual, que já passa 3:1 contra o fundo em
          claro e escuro — exigência de contraste não-textual (1.4.11).
          rounded-sm evita que o outline encoste no texto. */}
      <summary className="flex min-h-[48px] cursor-pointer items-center justify-between gap-4 rounded-sm py-4 text-left font-medium text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        {question}
        <span
          aria-hidden="true"
          className="shrink-0 text-muted transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="pb-4 text-body">{answer}</p>
    </details>
  );
}
