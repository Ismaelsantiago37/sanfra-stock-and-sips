import { createFileRoute } from "@tanstack/react-router";
import { Crown, Repeat, Users } from "lucide-react";
import { useState } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { brl, dateBR } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Adega do Sanfra" },
      {
        name: "description",
        content: "Base de clientes da adega com gasto total, frequência e nível de fidelidade.",
      },
      { property: "og:title", content: "Clientes — Adega do Sanfra" },
      { property: "og:description", content: "Quem compra, quanto gasta e com que frequência." },
    ],
  }),
  component: AdminClientes,
});

function AdminClientes() {
  const { customers } = useApp();
  const [q, setQ] = useState("");
  const list = customers.filter((c) =>
    `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q.toLowerCase()),
  );
  const totalGasto = customers.reduce((s, c) => s + c.totalSpent, 0);
  const vips = customers.filter((c) => c.level !== "CLIENTE").length;
  const freqMedia =
    customers.reduce((s, c) => s + c.frequency, 0) / Math.max(customers.length, 1);

  return (
    <AdminLayout title="Clientes" description="Base de clientes e comportamento de compra">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Clientes cadastrados" value={String(customers.length)} icon={Users} />
        <Kpi label="Clientes VIP/Black" value={String(vips)} icon={Crown} tone="positive" />
        <Kpi label="Compras/mês (média)" value={freqMedia.toFixed(1)} icon={Repeat} />
        <Kpi label="Gasto acumulado" value={brl(totalGasto)} tone="positive" />
      </div>

      <Panel title="Lista de clientes" className="mt-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, telefone ou e-mail"
          className="mb-3 max-w-sm"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Cliente</th>
                <th className="py-2">Contato</th>
                <th className="py-2 text-right">Pedidos</th>
                <th className="py-2 text-right">Gasto</th>
                <th className="py-2 text-right">Última compra</th>
                <th className="py-2 text-right">Nível</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-muted-foreground">{c.phone}</td>
                  <td className="py-2 text-right">{c.ordersCount}</td>
                  <td className="py-2 text-right">{brl(c.totalSpent)}</td>
                  <td className="py-2 text-right text-muted-foreground">
                    {dateBR(c.lastPurchaseAt)}
                  </td>
                  <td className="py-2 text-right">
                    <Badge variant={c.level === "CLIENTE" ? "outline" : "secondary"}>{c.level}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminLayout>
  );
}
