import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";

import { FlavorGrid, QtyStepper, SizeGrid } from "@/components/site/VariationPickers";
import { ComboDialog } from "@/components/site/ComboDialog";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { comboLines, groupFlavors, useApp } from "@/lib/store";
import type { CartItem, Product } from "@/lib/types";

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
  const { cart, products, cartSubtotal } = useApp();

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
              {cart.map((item, index) => {
                const p = products.find((x) => x.id === item.productId);
                if (!p) return null;
                return (
                  <CartLine
                    key={`${p.id}-${item.size ?? ""}-${index}`}
                    item={item}
                    index={index}
                    product={p}
                  />
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
                <Link to="/checkout">Finalizar compra</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}

function CartLine({ item, index, product }: { item: CartItem; index: number; product: Product }) {
  const { updateCartLine, unitPriceOf, stockLeft } = useApp();
  // ⚠️ LIMITE DE ESTOQUE no carrinho: não deixa aumentar além do disponível
  const last = item.flavors?.[item.flavors.length - 1];
  const maxQty = item.size
    ? stockLeft(product.id, item.size, index)
    : opts_kind(product) === "flavor" && last
      ? Math.min(
          stockLeft(product.id, undefined, index),
          (item.flavors ?? []).length + stockLeft(product.id, last, index) - (item.flavors ?? []).filter((f) => f === last).length,
        )
      : stockLeft(product.id, undefined, index);
  const [editing, setEditing] = useState(false);
  const opts = product.options;
  const unit = unitPriceOf(item);

  const setQty = (n: number) => {
    if (opts?.kind === "flavor") {
      const cur = item.flavors ?? [];
      const last = cur[cur.length - 1] ?? opts.flavors[0] ?? "";
      const flavors =
        n > cur.length ? [...cur, ...Array(n - cur.length).fill(last)] : cur.slice(0, n);
      updateCartLine(index, { ...item, quantity: n, flavors });
    } else {
      updateCartLine(index, { ...item, quantity: n });
    }
  };

  const title = item.size
    ? `${item.quantity}x ${product.name} - ${item.size}`
    : item.flavors?.length
      ? `${item.quantity}x ${product.name} (${groupFlavors(item.flavors)})`
      : `${item.quantity}x ${product.name}`;

  if (item.combo && opts?.kind === "combo") {
    return (
      <li className="rounded-xl border border-primary/35 bg-card p-3">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={80}
            height={80}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold">1x Combo: Whisky + Red Bull + Gelo</p>
            <ul className="mt-1 space-y-0.5 pl-2 text-xs text-muted-foreground">
              {comboLines(item.combo).map((line) => (
                <li key={line}>– {line}</li>
              ))}
            </ul>
            <p className="mt-2 font-display text-lg text-primary">{brl(unit)}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              size="icon"
              variant={editing ? "default" : "ghost"}
              onClick={() => setEditing(true)}
              aria-label="Editar combo"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => updateCartLine(index, null)}
              aria-label="Remover combo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ComboDialog
          product={product}
          open={editing}
          onOpenChange={setEditing}
          initial={item.combo}
          confirmLabel="Salvar alterações"
          onConfirm={(combo) => updateCartLine(index, { ...item, combo })}
        />
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-3">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={80}
          height={80}
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-primary">
            {brl(unit)} <span className="text-muted-foreground">un. • {brl(unit * item.quantity)}</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <QtyStepper value={item.quantity} onChange={setQty} max={Math.max(1, maxQty)} />
          {opts && (
            <Button
              size="icon"
              variant={editing ? "default" : "ghost"}
              onClick={() => setEditing((e) => !e)}
              aria-label={opts.kind === "size" ? `Alterar ${opts.optionLabel ?? "tamanho"}` : "Alterar sabores"}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => updateCartLine(index, null)}
            aria-label="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {editing && opts?.kind === "size" && (
        <div className="mt-3 space-y-2 border-t border-border pt-3 animate-in fade-in-0 slide-in-from-top-1">
          <p className="text-xs font-semibold text-muted-foreground">
            Alterar {opts.optionLabel ?? "tamanho"}
          </p>
          <SizeGrid
            sizes={opts.sizes}
            value={item.size}
            available={(sz) => stockLeft(product.id, sz, index)}
            onChange={(size) => updateCartLine(index, { ...item, size })}
          />
        </div>
      )}

      {editing && opts?.kind === "flavor" && (
        <div className="mt-3 space-y-3 border-t border-border pt-3 animate-in fade-in-0 slide-in-from-top-1">
          {(item.flavors ?? []).map((f, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Unidade {i + 1}
              </p>
              <FlavorGrid
                compact
                flavors={opts.flavors}
                value={f}
                available={(fl) => stockLeft(product.id, fl, index) - (item.flavors ?? []).filter((x, n) => x === fl && n !== i).length}
                onChange={(nf) => {
                  const flavors = [...(item.flavors ?? [])];
                  flavors[i] = nf;
                  updateCartLine(index, { ...item, flavors });
                }}
              />
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

function opts_kind(p: Product) {
  return p.options?.kind;
}
