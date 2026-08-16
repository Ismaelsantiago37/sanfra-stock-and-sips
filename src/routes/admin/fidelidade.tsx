import { createFileRoute } from "@tanstack/react-router";
import { Crown, Gift, Star } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import { brl, dateBR } from "@/lib/format";
import { coupons } from "@/lib/mock-data";
import { levelPerks, useApp } from "@/lib/store";
import type { LoyaltyLevel } from "@/lib/types";

export const Route = createFileRoute("/admin/fidelidade")({
  head: () => ({
    meta: [
      { title: "Programa de fidelidade — Adega do Sanfra" },
      {
        name: "description",
        content: "Níveis, pontos e cupons do clube de fidelidade dos clientes da adega.",
      },
      { property: "og:title", content: "Programa de fidelidade — Adega do Sanfra" },
      { property: "og:description", content: "Clube de vantagens e cupons da adega." },
    ],
  }),
  component: AdminFidelidade,
});

const niveis: LoyaltyLevel[] = ["CLIENTE", "VIP", "BLACK"];

function AdminFidelidade() {
  const { customers } = useApp();
  const pontos = customers.reduce((s, c) => s + c.points, 0);
  const cuponsUsados = customers.reduce((s, c) => s + c.couponsUsed, 0);
  const top = [...customers].sort((a, b) => b.points - a.points).slice(0, 8);

  return (
    <AdminLayout title="Fidelidade" description="Clube de vantagens da Adega do Sanfra">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Pontos em circulação" value={String(pontos)} icon={Star} tone="positive" />
        <Kpi label="Cupons resgatados" value={String(cuponsUsados)} icon={Gift} />
        <Kpi label="Clientes Black" value={String(customers.filter((c) => c.level === "BLACK").length)} icon={Crown} />
        <Kpi label="Clientes VIP" value={String(customers.filter((c) => c.level === "VIP").length)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {niveis.map((n) => (
          <Panel key={n} title={n} description={`${customers.filter((c) => c.level === n).length} clientes`}>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {levelPerks[n].map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top clientes por pontos">
          <table className="w-full text-sm">
            <tbody>
              {top.map((c) => (
                <tr key={c.id} className="border-t border-border first:border-0">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-right text-muted-foreground">{brl(c.totalSpent)}</td>
                  <td className="py-2 text-right text-primary">{c.points} pts</td>
                  <td className="py-2 text-right">
                    <Badge variant="outline">{c.level}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Cupons do clube">
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-base text-primary">{c.code}</p>
                  <Badge variant="secondary">
                    {c.type === "PERCENT" ? `${c.discount}%` : brl(c.discount)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nível mínimo {c.minLevel} · válido até {dateBR(c.expiresAt)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}
