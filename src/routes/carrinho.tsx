import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { cart, products, setQuantity, setVariant, cartSubtotal } = useApp();
  const priceOf = usePriceOf();

  const faltaEscolher = cart.some((item) => {
    const p = products.find((x) => x.id === item.productId);
    return !!p?.variants?.length && !item.variant;
  });

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
                const opcoes = p.variants ?? [];
                return (
                  <li
                    key={`${p.id}-${item.variant ?? ""}`}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3"
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
                      {opcoes.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <Select
                            value={item.variant ?? ""}
                            onValueChange={(v) => setVariant(p.id, item.variant, v)}
                          >
                            <SelectTrigger
                              className={
                                item.variant
                                  ? "h-9 w-56 text-xs"
                                  : "h-9 w-56 border-primary text-xs text-primary"
                              }
                              aria-label="Escolha o tamanho"
                            >
                              <SelectValue placeholder="Escolha o tamanho / opção" />
                            </SelectTrigger>
                            <SelectContent>
                              {opcoes.map((op) => (
                                <SelectItem key={op} value={op}>
                                  {op}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!item.variant && (
                            <span className="flex items-center gap-1 text-xs text-primary">
                              <AlertTriangle className="h-3.5 w-3.5" /> obrigatório
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setQuantity(p.id, item.quantity - 1, item.variant)}
                        aria-label="Diminuir"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setQuantity(p.id, item.quantity + 1, item.variant)}
                        aria-label="Aumentar"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setQuantity(p.id, 0, item.variant)}
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
              {faltaEscolher && (
                <p className="mt-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs text-muted-foreground">
                  Escolha o tamanho dos itens marcados acima para continuar.
                </p>
              )}
              {faltaEscolher ? (
                <Button size="lg" className="mt-4 w-full" disabled>
                  Fechar pedido
                </Button>
              ) : (
                <Button asChild size="lg" className="mt-4 w-full">
                  <Link to="/checkout">Fechar pedido</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}

