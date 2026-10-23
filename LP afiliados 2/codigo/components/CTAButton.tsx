import { content } from "@/content";

type Props = {
  /** Verbo de ação + valor, 1ª pessoa. Nunca "Enviar"/"Saiba mais". */
  label: string;
  /** Redutor de receio. Fica sob o botão, não dentro. */
  reassurance?: string;
  /** full = ocupa a largura NO MOBILE; volta ao tamanho natural em telas maiores. */
  variant?: "inline" | "full";
};

/**
 * O único CTA da página. Todo clique vai para o mesmo destino.
 *
 * rel="sponsored" é o correto para link de afiliado (orientação do
 * Google). noopener protege o window.opener ao abrir em nova aba.
 */
export function CTAButton({ label, reassurance, variant = "inline" }: Props) {
  return (
    <div className={variant === "full" ? "w-full sm:w-auto" : "inline-block"}>
      <a
        href={content.product.checkoutUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={[
          "inline-flex min-h-[56px] items-center justify-center rounded-lg",
          "bg-cta px-8 py-4 text-lg font-semibold text-white",
          // transition-[background-color], NÃO transition-colors: no
          // Tailwind v4 o atalho "colors" inclui outline-color, e isso
          // impedia a cor do foco de aplicar — o outline ficava preso no
          // currentColor (branco, por causa do text-white). Em seção
          // clara dava 1.04:1, ou seja, foco invisível no teclado
          // (WCAG 2.4.7). Aqui só o fundo do hover precisa animar.
          "shadow-sm transition-[background-color] hover:bg-cta-hover",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
          // Full-width é regra de mobile. No desktop um botão de 585px
          // perde a leitura de "botão" e vira faixa.
          variant === "full" ? "w-full sm:w-auto" : "",
        ].join(" ")}
      >
        {label}
      </a>
      {/* Sem text-align próprio: herda do container, então acompanha o
          botão tanto no hero (esquerda) quanto no CTA final (centro). */}
      {/* text-muted funciona nos dois tons (4.7:1 no claro, 7.3:1 no
          escuro) — o tom da seção resolve, sem prop. */}
      {reassurance && <p className="mt-2 text-sm text-muted">{reassurance}</p>}
    </div>
  );
}
