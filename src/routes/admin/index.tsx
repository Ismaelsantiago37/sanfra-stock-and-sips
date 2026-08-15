import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardList,
  Clock,
  DollarSign,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import {
  avgTicket,
  currentMonth,
  grossProfit,
  growth,
  margin,
  monthlyFinance,
  weekdayTraffic,
} from "@/lib/analytics";
import { brl, statusLabel, timeBR } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Painel do dono — Adega do Sanfra" },
      {
        name: "description",
        content: "Visão geral de vendas, despesas, lucro e operação da Adega do Sanfra.",
      },
      { property: "og:title", content: "Painel do dono — Adega do Sanfra" },
      { property: "og:description", content: "Resumo financeiro e operacional da adega." },
    ],
  }),
  component: Dashboard,
});

const atalhos = [
  { to: "/admin/vendas", label: "Dashboard de Vendas", icon: TrendingUp },
  { to: "/admin/despesas", label: "Dashboard de Despesas", icon: Receipt },
  { to: "/admin/lucro", label: "Dashboard de Lucro", icon: DollarSign },
  { to: "/admin/financeiro", label: "Financeiro consolidado", icon: BarChart3 },
  { to: "/admin/pico", label: "Horários de Pico", icon: Clock },
] as const;

function Dashboard() {
  const { orders, customers, pendings } = useApp();
  const abertos = orders.filter(
    (o) => o.status !== "ENTREGUE" && o.status !== "CANCELADO",
  );
  const aReceber = pendings
    .filter((p) => p.status !== "PAGO")
    .reduce((s, p) => s + p.amount, 0);
  const melhorDia = [...weekdayTraffic].sort((a, b) => b.customers - a.customers)[0]!;

  return (
    <AdminLayout title="Dashboard" description="Resumo do mês corrente da Adega do Sanfra">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Faturamento do mês"
          value={brl(currentMonth.revenue)}
          hint={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}% vs. mês anterior`}
          icon={TrendingUp}
          tone="positive"
        />
        <Kpi label="Despesas do mês" value={brl(currentMonth.expenses)} icon={Receipt} tone="negative" />
        <Kpi
          label="Lucro do mês"
          value={brl(grossProfit)}
          hint={`Margem de ${margin.toFixed(1)}%`}
          icon={DollarSign}
          tone="positive"
        />
        <Kpi label="Ticket médio" value={brl(avgTicket)} hint={`${currentMonth.orders} pedidos`} icon={Wallet} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Faturamento x despesas"
          description="Últimos 6 meses"
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFinance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => brl(v)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Faturamento"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Despesas"
                  stroke="var(--chart-4)"
                  fill="var(--chart-4)"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-3">
          <Kpi label="Pedidos em aberto" value={String(abertos.length)} icon={ClipboardList} />
          <Kpi label="Clientes cadastrados" value={String(customers.length)} icon={Users} />
          <Kpi label="Valores a receber" value={brl(aReceber)} icon={Wallet} tone="negative" />
          <Kpi
            label="Dia mais movimentado"
            value={melhorDia.day}
            hint={`${melhorDia.customers} clientes/semana`}
            icon={Clock}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Pedidos em andamento">
          <ul className="space-y-2">
            {abertos.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    #{o.number} — {o.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeBR(o.createdAt)} • {brl(o.total)}
                  </p>
                </div>
                <Badge>{statusLabel[o.status]}</Badge>
              </li>
            ))}
            {abertos.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum pedido em aberto agora.</p>
            )}
          </ul>
        </Panel>

        <Panel title="Análises detalhadas" description="Um dashboard para cada frente do negócio">
          <div className="grid gap-2 sm:grid-cols-2">
            {atalhos.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:border-primary/60"
              >
                <a.icon className="h-4 w-4 text-primary" />
                {a.label}
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}
