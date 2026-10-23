/**
 * Faixa fina no topo, decorativa — dá peso visual logo de cara, ecoando
 * a marca do produto (fundo escuro + dourado).
 *
 * Não é nav: não tem link nenhum. Uma barra de navegação real abriria
 * saída da página, contra a regra do CLAUDE.md ("sem links que
 * dispersem — LP é autônoma"). Só texto centralizado.
 *
 * Opcional: ausente quando o produto não tem um texto que valha a pena
 * (ex: sem selo de "independent review" definido).
 */
export function TopBar({ text }: { text: string }) {
  return (
    <div className="border-b border-line bg-dark px-4 py-3">
      <p className="eyebrow flex items-center justify-center gap-3 text-center text-accent">
        {/* Ponto pulsante: o único movimento contínuo da página. Serve
            de "sinal ao vivo" e puxa o olho para a declaração de
            independência, que é o enquadramento de tudo abaixo. */}
        <span
          aria-hidden="true"
          className="size-1.5 animate-pulse rounded-full bg-accent"
        />
        {text}
      </p>
    </div>
  );
}
