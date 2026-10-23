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
    <div className="tone-dark px-4 py-2.5 text-center text-sm font-medium text-accent">
      {text}
    </div>
  );
}
