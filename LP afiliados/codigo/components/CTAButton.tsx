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
        // Marca o clique de saída para o CheckoutClickTracker, que
        // dispara a conversão do Google Ads por delegação. Fica aqui, e
        // não como onClick, para o CTAButton continuar server component
        // (ver comentário no tracker).
        data-cta="checkout"
        className={[
          "group relative inline-flex min-h-[60px] items-center justify-center gap-3",
          "overflow-hidden rounded-md bg-cta px-9 py-4",
          // text-dark, não text-white: o CTA é lima (#EEFE3C). Ink dá
          // 16.04:1; branco daria 1.15:1 — botão ilegível.
          "font-display text-xl tracking-wide text-dark uppercase",
          // transition-[background-color,transform,box-shadow], NÃO
          // transition-colors: no Tailwind v4 o atalho "colors" inclui
          // outline-color, e isso impedia a cor do foco de aplicar — o
          // outline ficava preso no currentColor (branco, por causa do
          // text-white). Em seção clara dava 1.04:1, ou seja, foco
          // invisível no teclado (WCAG 2.4.7).
          "transition-[background-color,transform,box-shadow] duration-200",
          "shadow-[0_10px_30px_-10px_rgb(238_254_60/0.45)]",
          "hover:-translate-y-0.5 hover:bg-cta-hover",
          "hover:shadow-[0_16px_40px_-12px_rgb(238_254_60/0.6)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
          // Full-width é regra de mobile. No desktop um botão de 585px
          // perde a leitura de "botão" e vira faixa.
          variant === "full" ? "w-full sm:w-auto" : "",
        ].join(" ")}
      >
        {/* Brilho que atravessa o botão no hover. Decorativo e contido
            pelo overflow-hidden do pai. Escuro, não branco: sobre lima
            um brilho branco não aparece — o botão já é quase branco em
            luminância. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-dark/12 transition-all duration-500 group-hover:left-[150%]"
        />
        <span className="relative">{label}</span>
        <span
          aria-hidden="true"
          className="relative transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </a>
      {/* Sem text-align próprio: herda do container, então acompanha o
          botão tanto no hero (esquerda) quanto no CTA final (centro). */}
      {/* text-muted funciona nos dois tons (4.7:1 no claro, 7.3:1 no
          escuro) — o tom da seção resolve, sem prop. */}
      {reassurance && <p className="mt-2 text-sm text-muted">{reassurance}</p>}
    </div>
  );
}
