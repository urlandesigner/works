import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import type { TrendPoint } from '@/types';
import { Card } from '@/components/ui/Card';

export function SiteTrendChart({ trend }: { trend: TrendPoint[] }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Tendência · usuários (7 dias)</h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-600">— Atual</span>
          <span className="text-zinc-400">--- Anterior</span>
        </div>
      </div>
      <Card className="px-4 py-4">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} />
              <Tooltip
                cursor={{ stroke: '#e4e4e7' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="anterior" name="Anterior" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="atual" name="Atual" stroke="#18181b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}
