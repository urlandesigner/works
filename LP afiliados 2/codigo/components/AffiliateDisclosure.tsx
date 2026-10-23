import { content } from "@/content";

/**
 * Divulgação de afiliado — obrigatória por lei (FTC nos EUA, CONAR/CDC
 * no Brasil, depende do mercado) e visível.
 *
 * Slot fixo do template: não é opcional e não deve ser escondido em
 * rodapé cinza ilegível. Declarar a relação comercial é exigência legal
 * e, junto da análise honesta, o que sustenta a confiança da página.
 */
export function AffiliateDisclosure() {
  const { label, text } = content.affiliateDisclosure;

  return (
    <aside className="rounded-lg border border-line bg-surface p-4 text-sm text-body">
      <p>
        <span className="font-semibold text-heading">{label} </span>
        {text}
      </p>
    </aside>
  );
}
