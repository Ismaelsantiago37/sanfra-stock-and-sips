import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { useApp, usePriceOf } from "@/lib/store";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Meu carrinho — Adega do Sanfra" },
      { name: "description", content: "Revise seus itens antes de fechar o pedido na adega." },
      { property: "og:title", content: "Meu carrinho — Adega do Sanfra" },
      { property: "og:description", content: "Revise seus itens antes de fechar o pedido." },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const { cart, products, setQuantity, cartSubtotal } = useApp();
  const priceOf = usePriceOf();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl">
          <ShoppingCart className="h-6 w-6 text-primary" /> Meu carrinho
        </h1>

        {cart.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Button asChild className="mt-4">
              <Link to="/produtos">Ver produtos</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-3">
              {cart.map((item) => {
                const p = products.find((x) => x.id === item.productId);
                if (!p) return null;
                const { price } = priceOf(p.id);
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={80}
                      height={80}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-sm text-primary">{brl(price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setQuantity(p.id, item.quantity - 1)}
                        aria-label="Diminuir"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setQuantity(p.id, item.quantity + 1)}
                        aria-label="Aumentar"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setQuantity(p.id, 0)}
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{brl(cartSubtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Entrega</span>
                <span>{brl(6)} (ou grátis na retirada)</span>
              </div>
              <Button asChild size="lg" className="mt-4 w-full">
                <Link to="/checkout">Fechar pedido</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
