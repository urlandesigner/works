import type { ComparisonRow } from "@/content";

type Props = {
  /** Nome completo — cabe no cabeçalho do desktop. */
  productName: string;
  /** Nome curto — usado nos rótulos do mobile, que se repetem por linha. */
  productShortName: string;
  alternativeName: string;
  rows: ComparisonRow[];
};

/**
 * Tabela real (semântica preservada) que vira lista empilhada no mobile:
 * o <thead> some e cada linha ganha rótulo próprio. Nunca scroll horizontal.
 *
 * No mobile os rótulos usam o nome CURTO: eles se repetem em toda linha,
 * e nome completo de e-commerce (10+ palavras) viraria ruído maior que
 * o próprio conteúdo da comparação.
 */
export function ComparisonTable({
  productName,
  productShortName,
  alternativeName,
  rows,
}: Props) {
  if (rows.length === 0) return null;

  return (
    <table className="w-full border-collapse text-left">
      <thead className="hidden sm:table-header-group">
        <tr className="border-b border-line">
          <th className="py-3 pr-4 text-sm font-semibold text-muted">
            Critério
          </th>
          <th className="py-3 pr-4 text-sm font-semibold text-heading">
            {productName}
          </th>
          <th className="py-3 text-sm font-semibold text-muted">
            {alternativeName}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.criterion}
            className="block border-b border-line py-4 sm:table-row sm:py-0"
          >
            <td className="block pb-2 font-semibold text-heading sm:table-cell sm:py-4 sm:pr-4 sm:align-top sm:font-medium">
              {row.criterion}
            </td>
            <td className="block pb-2 text-body sm:table-cell sm:py-4 sm:pr-4 sm:align-top">
              <span className="mb-0.5 block text-xs font-medium text-muted sm:hidden">
                {productShortName}
              </span>
              {row.product}
            </td>
            <td className="block text-muted sm:table-cell sm:py-4 sm:align-top">
              <span className="mb-0.5 block text-xs font-medium text-muted sm:hidden">
                {alternativeName}
              </span>
              {row.alternative}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
