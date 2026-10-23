import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/Card';
import { useOverviewTrend } from '@/hooks/useOverviewTrend';

export function PortfolioTrend() {
  const { data } = useOverviewTrend();
  if (!data || data.length === 0) return null;

  return (
    <Card className="px-4 py-4">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">Tendência · visitantes (7 dias)</h2>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="dia"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#a1a1aa' }}
            />
            <Tooltip
              cursor={{ stroke: '#e4e4e7' }}
              contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="usuarios"
              name="Visitantes"
              stroke="#18181b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
