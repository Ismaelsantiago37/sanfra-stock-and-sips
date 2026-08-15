import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brl } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Fechar pedido — Adega do Sanfra" },
      {
        name: "description",
        content: "Escolha entrega ou retirada, forma de pagamento e finalize seu pedido.",
      },
      { property: "og:title", content: "Fechar pedido — Adega do Sanfra" },
      { property: "og:description", content: "Entrega ou retirada, com pagamento na hora." },
    ],
  }),
  component: Checkout,
});

const payments: { id: PaymentMethod; label: string }[] = [
  { id: "PIX", label: "Pix" },
  { id: "CARTAO", label: "Cartão na entrega" },
  { id: "DINHEIRO", label: "Dinheiro" },
  { id: "FIADO", label: "Pendente (fiado)" },
];

function Checkout() {
  const { cart, cartSubtotal, placeOrder, customer } = useApp();
  const navigate = useNavigate();
  const [type, setType] = useState<"ENTREGA" | "RETIRADA">("ENTREGA");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [note, setNote] = useState("");

  const fee = type === "ENTREGA" ? 6 : 0;

  if (cart.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-muted-foreground">Nada no carrinho para finalizar.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/produtos" })}>
            Ver produtos
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl">Fechar pedido</h1>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">Como você quer receber?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["ENTREGA", "RETIRADA"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-lg border border-border px-4 py-3 text-sm",
                  type === t && "border-primary text-primary",
                )}
              >
                {t === "ENTREGA" ? "Entrega (R$ 6,00)" : "Retirar na adega"}
              </button>
            ))}
          </div>
          {type === "ENTREGA" && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="end">Endereço de entrega</Label>
              <Input id="end" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          )}
        </section>

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">Forma de pagamento</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {payments.map((p) => (
              <button
                key={p.id}
                onClick={() => setPaymentMethod(p.id)}
                className={cn(
                  "rounded-lg border border-border px-4 py-3 text-sm",
                  paymentMethod === p.id && "border-primary text-primary",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="obs">Observação</Label>
            <Textarea
              id="obs"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: tudo bem gelado, interfone quebrado"
            />
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{brl(cartSubtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Entrega</span>
            <span>{brl(fee)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <span className="font-medium">Total</span>
            <span className="font-display text-2xl text-primary">{brl(cartSubtotal + fee)}</span>
          </div>
          <Button
            size="lg"
            className="mt-4 w-full"
            onClick={() => {
              const order = placeOrder({
                type,
                ...(type === "ENTREGA" ? { address } : {}),
                paymentMethod,
                ...(note ? { note } : {}),
              });
              toast.success(`Pedido #${order.number} enviado!`, {
                description: "Acompanhe o status em Meus Pedidos.",
              });
              navigate({ to: "/pedidos" });
            }}
          >
            Confirmar pedido
          </Button>
        </section>
      </div>
    </SiteLayout>
  );
}
