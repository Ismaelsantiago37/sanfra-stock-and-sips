import { createFileRoute } from "@tanstack/react-router";
import { Receipt, ShoppingBag, TrendingUp, Users } from "lucide-react";
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
import {
  avgTicket,
  chartColors,
  currentMonth,
  growth,
  salesByCategory,
  salesByChannel,
  weekdayTraffic,
} from "@/lib/analytics";
import { brl } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/metricas")({
  head: () => ({
    meta: [
      { title: "Métricas gerais — Adega do Sanfra" },
      {
        name: "description",
        content: "Indicadores de vendas, ticket médio, canais e categorias mais vendidas da adega.",
      },
      { property: "og:title", content: "Métricas gerais — Adega do Sanfra" },
      { property: "og:description", content: "Panorama de indicadores da operação." },
    ],
  }),
  component: AdminMetricas,
});

function AdminMetricas() {
  const { products, customers } = useApp();
  const topProdutos = [...products].sort((a, b) => b.timesOrdered - a.timesOrdered).slice(0, 8);

  return (
    <AdminLayout title="Métricas" description="Indicadores gerais da operação">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Pedidos no mês" value={String(currentMonth.orders)} icon={ShoppingBag} />
        <Kpi label="Ticket médio" value={brl(avgTicket)} icon={Receipt} />
        <Kpi
          label="Crescimento"
          value={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}
          icon={TrendingUp}
          tone={growth >= 0 ? "positive" : "negative"}
        />
        <Kpi label="Clientes ativos" value={String(customers.length)} icon={Users} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Vendas por categoria">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => brl(v)}
                />
                <Bar dataKey="value" name="Vendas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Entrega x retirada">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByChannel} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {salesByChannel.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
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
        <Panel title="Faturamento por dia da semana">
          <div className="h-64">
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

        <Panel title="Produtos mais vendidos">
          <table className="w-full text-sm">
            <tbody>
              {topProdutos.map((p) => (
                <tr key={p.id} className="border-t border-border first:border-0">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-right text-muted-foreground">{brl(p.price)}</td>
                  <td className="py-2 text-right text-primary">{p.timesOrdered} vendas</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </AdminLayout>
  );
}
