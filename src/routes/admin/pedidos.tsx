import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brl, paymentLabel, statusLabel, timeBR } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({
    meta: [
      { title: "Gestão de pedidos — Adega do Sanfra" },
      {
        name: "description",
        content: "Acompanhe e atualize o status de cada pedido da adega em tempo real.",
      },
      { property: "og:title", content: "Gestão de pedidos — Adega do Sanfra" },
      { property: "og:description", content: "Fila de pedidos e mudança de status da operação." },
    ],
  }),
  component: AdminPedidos,
});

const fluxo: OrderStatus[] = [
  "RECEBIDO",
  "EM_PREPARACAO",
  "PRONTO",
  "SAIU_ENTREGA",
  "ENTREGUE",
  "CANCELADO",
];

function AdminPedidos() {
  const { orders, updateOrderStatus } = useApp();
  const [filter, setFilter] = useState<OrderStatus | "TODOS">("TODOS");
  const list = filter === "TODOS" ? orders : orders.filter((o) => o.status === filter);

  return (
    <AdminLayout title="Pedidos" description="Fila da operação e atualização de status">
      <div className="mb-4 flex flex-wrap gap-2">
        {(["TODOS", ...fluxo] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s === "TODOS" ? "Todos" : statusLabel[s]}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((o) => (
          <Panel key={o.id} title={`Pedido #${o.number}`} description={`${o.customerName} · ${timeBR(o.createdAt)}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{statusLabel[o.status]}</Badge>
              <Badge variant="outline">{o.type === "ENTREGA" ? "Entrega" : "Retirada"}</Badge>
              <Badge variant="outline">{paymentLabel[o.paymentMethod]}</Badge>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {o.items.map((i) => (
                <li key={i.productId}>
                  {i.quantity}x {i.name} — {brl(i.unitPrice * i.quantity)}
                </li>
              ))}
            </ul>
            {o.address && <p className="mt-2 text-xs text-muted-foreground">{o.address}</p>}
            <p className="mt-2 font-display text-lg">{brl(o.total)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fluxo.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={o.status === s ? "default" : "outline"}
                  onClick={() => updateOrderStatus(o.id, s)}
                >
                  {statusLabel[s]}
                </Button>
              ))}
            </div>
          </Panel>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum pedido nesse status.</p>
        )}
      </div>
    </AdminLayout>
  );
}
