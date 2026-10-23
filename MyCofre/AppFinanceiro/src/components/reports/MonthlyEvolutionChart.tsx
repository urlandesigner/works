import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type MonthlyEvolutionPoint = {
  label: string
  value: number
}

type MonthlyEvolutionChartProps = {
  data: MonthlyEvolutionPoint[]
  loading?: boolean
  formatCurrency: (value: number) => string
}

export function MonthlyEvolutionChart({
  data,
  loading = false,
  formatCurrency,
}: MonthlyEvolutionChartProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="card-block-heading mb-0">Evolução do patrimônio</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-ds-muted">
          Ainda não há fechamentos mensais para exibir a evolução.
        </p>
      ) : (
        <div className="h-60 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200/80 dark:stroke-white/[0.08]"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                className="fill-slate-500 dark:fill-slate-300"
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(Number(value))}
                tick={{ fontSize: 12 }}
                width={92}
                axisLine={false}
                tickLine={false}
                className="fill-slate-500 dark:fill-slate-300"
              />
              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value ?? 0))
                }
                labelClassName="text-xs font-medium"
                contentStyle={{
                  borderRadius: 12,
                  borderColor: 'rgba(148,163,184,0.25)',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name="Patrimônio"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

