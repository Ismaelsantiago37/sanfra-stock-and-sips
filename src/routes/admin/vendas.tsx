import { createFileRoute } from "@tanstack/react-router";
import { Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import {
  avgTicket,
  chartColors,
  currentMonth,
  growth,
  monthlyFinance,
  salesByCategory,
  salesByChannel,
  weekdayTraffic,
} from "@/lib/analytics";
import { brl } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/vendas")({
  head: () => ({
    meta: [
      { title: "Dashboard de vendas — Adega do Sanfra" },
      {
        name: "description",
        content: "Faturamento, ticket médio, mix de categorias e produtos mais vendidos da adega.",
      },
      { property: "og:title", content: "Dashboard de vendas — Adega do Sanfra" },
      { property: "og:description", content: "Análise completa das vendas da adega." },
    ],
  }),
  component: Vendas,
});

function Vendas() {
  const { products } = useApp();
  const top = [...products].sort((a, b) => b.timesOrdered - a.timesOrdered).slice(0, 7);

  return (
    <AdminLayout title="Vendas" description="Como a adega está vendendo">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Faturamento do mês" value={brl(currentMonth.revenue)} icon={TrendingUp} tone="positive" />
        <Kpi label="Pedidos" value={String(currentMonth.orders)} icon={ShoppingBag} />
        <Kpi label="Ticket médio" value={brl(avgTicket)} icon={Users} />
        <Kpi
          label="Crescimento"
          value={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}
          hint="vs. mês anterior"
          icon={Package}
          tone={growth >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Evolução do faturamento" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFinance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => brl(v)}
                />
                <Line type="monotone" dataKey="revenue" name="Faturamento" stroke="var(--chart-1)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Entrega x retirada">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByChannel} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {salesByChannel.map((entry, i) => (
                    <Cell key={entry.name} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => `${v}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Vendas por categoria" description="Faturamento acumulado no mês">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis dataKey="name" type="category" width={90} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => brl(v)}
                />
                <Bar dataKey="value" name="Faturamento" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Faturamento por dia da semana">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => brl(v)}
                />
                <Bar dataKey="revenue" name="Faturamento" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Produtos mais vendidos" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Produto</th>
                <th className="py-2">Preço</th>
                <th className="py-2">Pedidos</th>
                <th className="py-2">Estoque</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2 pr-3">{p.name}</td>
                  <td className="py-2 pr-3">{brl(p.price)}</td>
                  <td className="py-2 pr-3 text-primary">{p.timesOrdered}</td>
                  <td className="py-2">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminLayout>
  );
}
