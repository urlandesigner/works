import type { ChannelRow } from '@/types';
import { Card } from '@/components/ui/Card';
import { DeltaPill } from '@/components/ui/DeltaPill';
import { formatNumber } from '@/lib/format';

export function ChannelTable({ channels }: { channels: ChannelRow[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-zinc-900">Origens de tráfego</h2>
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs text-zinc-500">
              <th className="px-4 py-2 text-left font-medium">Canal</th>
              <th className="px-4 py-2 text-right font-medium">Usuários</th>
              <th className="px-4 py-2 text-right font-medium">Sessões</th>
              <th className="px-4 py-2 text-right font-medium">Conversões</th>
              <th className="px-4 py-2 text-right font-medium">Δ 7v7</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => (
              <tr key={c.canal} className="border-b border-zinc-50 last:border-0">
                <td className="px-4 py-2.5 text-zinc-900">{c.canal}</td>
                <td className="px-4 py-2.5 text-right text-zinc-700">{formatNumber(c.usuarios)}</td>
                <td className="px-4 py-2.5 text-right text-zinc-700">{formatNumber(c.sessoes)}</td>
                <td className="px-4 py-2.5 text-right text-zinc-700">{formatNumber(c.conversoes)}</td>
                <td className="px-4 py-2.5 text-right">
                  <DeltaPill variation={c.varUsuarios} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
