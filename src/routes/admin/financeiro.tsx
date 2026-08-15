import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Banknote, Wallet } from "lucide-react";
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
import { chartColors, monthlyFinance, totalExpenses } from "@/lib/analytics";
import { brl, paymentLabel } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Adega do Sanfra" },
      {
        name: "description",
        content: "Fluxo de caixa consolidado: entradas, saídas, formas de pagamento e valores a receber.",
      },
      { property: "og:title", content: "Financeiro — Adega do Sanfra" },
      { property: "og:description", content: "Fluxo de caixa consolidado da adega." },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const { orders, pendings } = useApp();

  const entradas = orders
    .filter((o) => o.status !== "CANCELADO")
    .reduce((s, o) => s + o.total, 0);
  const aReceber = pendings.filter((p) => p.status !== "PAGO").reduce((s, p) => s + p.amount, 0);
  const caixa = entradas - totalExpenses;

  const porPagamento = Object.entries(
    orders
      .filter((o) => o.status !== "CANCELADO")
      .reduce<Record<string, number>>((acc, o) => {
        acc[o.paymentMethod] = (acc[o.paymentMethod] ?? 0) + o.total;
        return acc;
      }, {}),
  ).map(([k, v]) => ({ name: paymentLabel[k] ?? k, value: Number(v.toFixed(2)) }));

  const fluxo = monthlyFinance.map((m) => ({
    month: m.month,
    entradas: m.revenue,
    saidas: -m.expenses,
  }));

  return (
    <AdminLayout title="Financeiro" description="Entradas, saídas e caixa da adega">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Entradas (pedidos)" value={brl(entradas)} icon={ArrowUpRight} tone="positive" />
        <Kpi label="Saídas (despesas)" value={brl(totalExpenses)} icon={ArrowDownRight} tone="negative" />
        <Kpi label="Saldo em caixa" value={brl(caixa)} icon={Banknote} tone={caixa >= 0 ? "positive" : "negative"} />
        <Kpi label="A receber (fiado)" value={brl(aReceber)} icon={Wallet} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Fluxo de caixa" description="Entradas positivas, saídas negativas" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxo} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                  formatter={(v: number) => brl(Math.abs(v))}
                />
                <Legend />
                <Bar dataKey="entradas" name="Entradas" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Formas de pagamento">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={porPagamento} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {porPagamento.map((e, i) => (
                    <Cell key={e.name} fill={chartColors[i % chartColors.length]} />
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
      </div>
    </AdminLayout>
  );
}
