import type { PageRow } from '@/types';
import { Card } from '@/components/ui/Card';
import { DeltaPill } from '@/components/ui/DeltaPill';
import { formatNumber } from '@/lib/format';

export function PagesTable({ pages }: { pages: PageRow[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-zinc-900">Principais páginas</h2>
      <Card>
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs text-zinc-500">
              <th className="w-1/2 px-4 py-2 text-left font-medium">Página</th>
              <th className="px-4 py-2 text-right font-medium">Visualizações</th>
              <th className="px-4 py-2 text-right font-medium">Δ 7v7</th>
              <th className="px-4 py-2 text-right font-medium">% do total</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.pagePath} className="border-b border-zinc-50 last:border-0">
                <td className="px-4 py-2.5">
                  <div className="truncate">
                    <span className="text-zinc-900">{p.pagePath}</span>
                    {p.pageTitle && <span className="text-zinc-400"> · {p.pageTitle}</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right text-zinc-700">{formatNumber(p.pageviews)}</td>
                <td className="px-4 py-2.5 text-right">
                  <DeltaPill variation={p.varPageviews} />
                </td>
                <td className="px-4 py-2.5 text-right text-zinc-700">
                  {p.pctTotal === null ? '—' : `${p.pctTotal.toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
