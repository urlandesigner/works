type Props = {
  title?: string;
  /**
   * Tom da seção. A página alterna claro/escuro a cada seção, ecoando o
   * ritmo visual da página oficial do produto.
   *
   * "gold" é faixa de destaque, não seção normal — usar com pouco
   * conteúdo (uma linha, um selo), senão vira parede amarela.
   */
  tone?: "light" | "dark" | "gold";
  /** Faixa fina (menos padding vertical). Para divisores tipo tone="gold". */
  compact?: boolean;
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
  tone = "light",
  compact = false,
  children,
}: Props) {
  return (
    <section className={`tone-${tone}`}>
      <div
        className={[
          "mx-auto max-w-3xl px-5",
          compact ? "py-6" : "py-14 sm:py-20",
        ].join(" ")}
      >
        {title && (
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
