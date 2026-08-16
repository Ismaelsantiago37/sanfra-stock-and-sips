import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, PiggyBank, Percent, Target } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { currentMonth, grossProfit, margin, monthlyFinance } from "@/lib/analytics";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/lucro")({
  head: () => ({
    meta: [
      { title: "Dashboard de lucro — Adega do Sanfra" },
      {
        name: "description",
        content: "Lucro líquido, margem, ponto de equilíbrio e evolução dos resultados da adega.",
      },
      { property: "og:title", content: "Dashboard de lucro — Adega do Sanfra" },
      { property: "og:description", content: "Resultado e margem da adega mês a mês." },
    ],
  }),
  component: Lucro,
});

function Lucro() {
  const data = monthlyFinance.map((m) => ({
    ...m,
    profit: m.revenue - m.expenses,
    marginPct: Number((((m.revenue - m.expenses) / m.revenue) * 100).toFixed(1)),
  }));
  const acumulado = data.reduce((s, m) => s + m.profit, 0);
  const breakEven = currentMonth.expenses;
  const diario = grossProfit / 30;

  return (
    <AdminLayout title="Lucro" description="Resultado real depois de pagar as contas">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Lucro do mês" value={brl(grossProfit)} icon={DollarSign} tone="positive" />
        <Kpi label="Margem líquida" value={`${margin.toFixed(1)}%`} icon={Percent} tone="positive" />
        <Kpi label="Lucro acumulado (6 meses)" value={brl(acumulado)} icon={PiggyBank} />
        <Kpi
          label="Ponto de equilíbrio"
          value={brl(breakEven)}
          hint={`Média de ${brl(diario)} de lucro por dia`}
          icon={Target}
        />
      </div>

      <Panel title="Faturamento, despesa e lucro" description="Últimos 6 meses" className="mt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                formatter={(v: number, name: string) => (name === "Margem" ? `${v}%` : brl(v))}
              />
              <Legend />
              <Bar dataKey="revenue" name="Faturamento" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Despesas" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="profit" name="Lucro" stroke="var(--chart-1)" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Evolução da margem (%)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => `${v}%`}
                />
                <Bar dataKey="marginPct" name="Margem" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Resultado mês a mês">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Mês</th>
                  <th className="py-2 text-right">Faturamento</th>
                  <th className="py-2 text-right">Despesas</th>
                  <th className="py-2 text-right">Lucro</th>
                  <th className="py-2 text-right">Margem</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.month} className="border-t border-border">
                    <td className="py-2">{m.month}</td>
                    <td className="py-2 text-right">{brl(m.revenue)}</td>
                    <td className="py-2 text-right">{brl(m.expenses)}</td>
                    <td className="py-2 text-right text-success">{brl(m.profit)}</td>
                    <td className="py-2 text-right text-primary">{m.marginPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}
