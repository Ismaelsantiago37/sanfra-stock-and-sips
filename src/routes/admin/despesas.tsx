import { createFileRoute } from "@tanstack/react-router";
import { Percent, Receipt, Repeat, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import {
  chartColors,
  currentMonth,
  expenses,
  monthlyFinance,
  totalExpenses,
} from "@/lib/analytics";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/despesas")({
  head: () => ({
    meta: [
      { title: "Dashboard de despesas — Adega do Sanfra" },
      {
        name: "description",
        content: "Custos fixos e variáveis da adega: fornecedores, folha, energia, logística e impostos.",
      },
      { property: "og:title", content: "Dashboard de despesas — Adega do Sanfra" },
      { property: "og:description", content: "Controle de custos da adega." },
    ],
  }),
  component: Despesas,
});

function Despesas() {
  const fixas = expenses.filter((e) => e.recurring).reduce((s, e) => s + e.amount, 0);
  const variaveis = totalExpenses - fixas;
  const pctReceita = (currentMonth.expenses / currentMonth.revenue) * 100;
  const maior = [...expenses].sort((a, b) => b.amount - a.amount)[0]!;

  return (
    <AdminLayout title="Despesas" description="Para onde o dinheiro da adega está indo">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Despesas do mês" value={brl(totalExpenses)} icon={Receipt} tone="negative" />
        <Kpi label="Custos fixos" value={brl(fixas)} hint="Recorrentes todo mês" icon={Repeat} />
        <Kpi label="Custos variáveis" value={brl(variaveis)} icon={TrendingDown} />
        <Kpi
          label="Despesa / faturamento"
          value={`${pctReceita.toFixed(1)}%`}
          hint={`Maior custo: ${maior.category}`}
          icon={Percent}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Composição das despesas">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenses}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={95}
                >
                  {expenses.map((e, i) => (
                    <Cell key={e.id} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => brl(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Despesas mês a mês">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => brl(v)}
                />
                <Bar dataKey="expenses" name="Despesas" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Lançamentos do mês" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Categoria</th>
                <th className="py-2">Descrição</th>
                <th className="py-2">Tipo</th>
                <th className="py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="py-2 pr-3 font-medium">{e.category}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{e.description}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={e.recurring ? "default" : "outline"}>
                      {e.recurring ? "Fixa" : "Variável"}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">{brl(e.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-border font-medium">
                <td className="py-2" colSpan={3}>
                  Total
                </td>
                <td className="py-2 text-right text-primary">{brl(totalExpenses)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminLayout>
  );
}
