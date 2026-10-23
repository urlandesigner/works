type Props = {
  title?: string;
  /** Sobrelinha curta em caixa-alta acima do título. Ex: "02 — Analysis". */
  eyebrow?: string;
  /**
   * Tom da seção. A página alterna escuro/claro, criando ritmo de
   * capa-escura / miolo-claro de revista.
   *
   * "band" é faixa de destaque, não seção normal — usar com pouco
   * conteúdo (uma linha), senão vira parede azul.
   */
  tone?: "light" | "dark" | "band";
  /** Faixa fina (menos padding vertical). Para divisores tipo tone="band". */
  compact?: boolean;
  /** Largura maior, para grades (ex: preço em 3 cards). */
  wide?: boolean;
  children: React.ReactNode;
};

/**
 * Espaçamento, largura e TOM padrão de toda seção.
 *
 * O tom troca as variáveis --tone-* (ver globals.css), então os filhos
 * usam text-heading / text-body / text-muted / text-accent e ficam
 * legíveis em qualquer fundo, sem saber em qual estão. Não declarar cor
 * fixa (text-neutral-700, text-white) dentro de uma seção — quebra ao
 * trocar o tom.
 */
export function SectionShell({
  title,
  eyebrow,
  tone = "light",
  compact = false,
  wide = false,
  children,
}: Props) {
  return (
    <section className={`tone-${tone}`}>
      <div
        className={[
          "mx-auto px-5",
          wide ? "max-w-6xl" : "max-w-3xl",
          compact ? "py-7" : "py-16 sm:py-24",
        ].join(" ")}
      >
        {(title || eyebrow) && (
          <header className="reveal mb-10">
            {eyebrow && (
              <p className="eyebrow mb-3 flex items-center gap-3 text-accent">
                {eyebrow}
                {/* Régua que sai do rótulo e morre no fim da coluna —
                    marca de ficha técnica, e dá direção horizontal
                    numa página que é toda vertical. */}
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </p>
            )}
            {title && (
              <h2 className="font-display text-4xl text-heading uppercase sm:text-5xl">
                {title}
              </h2>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
