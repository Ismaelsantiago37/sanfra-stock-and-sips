import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { brl, dateBR, paymentLabel, statusLabel, timeBR } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Meus pedidos — Adega do Sanfra" },
      {
        name: "description",
        content: "Acompanhe em tempo real o status dos seus pedidos na Adega do Sanfra.",
      },
      { property: "og:title", content: "Meus pedidos — Adega do Sanfra" },
      { property: "og:description", content: "Acompanhe o status dos seus pedidos." },
    ],
  }),
  component: Pedidos,
});

const steps: OrderStatus[] = ["RECEBIDO", "EM_PREPARACAO", "PRONTO", "SAIU_ENTREGA", "ENTREGUE"];

function Pedidos() {
  const { orders, user } = useApp();
  const mine = orders.filter((o) => !user?.customerId || o.customerId === user.customerId);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl">
          <Receipt className="h-6 w-6 text-primary" /> Meus pedidos
        </h1>

        {mine.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Você ainda não fez pedidos por aqui.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {mine.map((o) => {
            const stepIndex = steps.indexOf(o.status);
            return (
              <article key={o.id} className="rounded-xl border border-border bg-card p-4">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-lg">Pedido #{o.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateBR(o.createdAt)} às {timeBR(o.createdAt)} • {o.type === "ENTREGA" ? "Entrega" : "Retirada"} •{" "}
                      {paymentLabel[o.paymentMethod]}
                    </p>
                  </div>
                  <Badge variant={o.status === "CANCELADO" ? "destructive" : "default"}>
                    {statusLabel[o.status]}
                  </Badge>
                </header>

                {o.status !== "CANCELADO" && (
                  <div className="mt-4 flex items-center gap-1">
                    {steps.map((s, i) => (
                      <div key={s} className="flex-1">
                        <div
                          className={cn(
                            "h-1.5 rounded-full bg-muted",
                            i <= stepIndex && "bg-primary",
                          )}
                        />
                        <p className="mt-1 hidden text-[10px] text-muted-foreground sm:block">
                          {statusLabel[s]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <ul className="mt-4 space-y-1 text-sm">
                  {o.items.map((i) => (
                    <li key={i.productId} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">
                        {i.quantity}x {i.name}
                      </span>
                      <span>{brl(i.unitPrice * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-border pt-3 text-right">
                  Total <span className="font-display text-xl text-primary">{brl(o.total)}</span>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
