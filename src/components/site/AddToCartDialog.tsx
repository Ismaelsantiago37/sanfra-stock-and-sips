import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ComboDialog } from "./ComboDialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brl } from "@/lib/format";
import { groupFlavors, useApp, usePriceOf } from "@/lib/store";
import type { Product } from "@/lib/types";

import { Chip, FlavorGrid, QtyStepper, SizeGrid } from "./VariationPickers";

export function AddToCartDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { addToCart } = useApp();
  const priceOf = usePriceOf();
  const opts = product.options;
  const optionLabel = opts?.kind === "size" ? (opts.optionLabel ?? "tamanho") : "tamanho";

  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<"same" | "diff">("same");
  const [flavor, setFlavor] = useState<string | undefined>();
  const [perUnit, setPerUnit] = useState<(string | undefined)[]>([]);
  const [size, setSize] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setQty(1);
      setMode("same");
      setFlavor(undefined);
      setPerUnit([]);
      setSize(undefined);
    }
  }, [open]);

  const unit =
    opts?.kind === "size" && size
      ? (opts.sizes.find((s) => s.label === size)?.price ?? priceOf(product.id).price)
      : priceOf(product.id).price;

  let flavors: string[] | undefined;
  let ready = true;
  if (opts?.kind === "flavor") {
    if (qty === 1 || mode === "same") {
      flavors = flavor ? Array(qty).fill(flavor) : undefined;
    } else {
      const list = Array.from({ length: qty }, (_, i) => perUnit[i]);
      flavors = list.every(Boolean) ? (list as string[]) : undefined;
    }
    ready = !!flavors;
  }
  if (opts?.kind === "size") ready = !!size;

  const confirm = () => {
    addToCart(product.id, qty, { size, flavors });
    toast.success("Adicionado ao carrinho", {
      description: `${qty}x ${product.name}${size ? ` - ${size}` : ""}${flavors ? ` (${groupFlavors(flavors)})` : ""}`,
    });
    onOpenChange(false);
  };

  if (opts?.kind === "combo") {
    return (
      <ComboDialog
        product={product}
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={(combo) => {
          addToCart(product.id, 1, { combo });
          toast.success("Combo adicionado ao carrinho", { description: product.name });
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img
              src={product.image}
              alt={product.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="text-left">
              <DialogTitle className="font-display text-xl">{product.name}</DialogTitle>
              <DialogDescription>Personalize antes de adicionar ao carrinho.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {opts?.kind === "size" && (
          <section className="space-y-2">
            <p className="text-sm font-semibold">1. Escolha {optionLabel === "marca" ? "a marca" : optionLabel === "sabor" ? "o sabor" : "o tamanho"}</p>
            <SizeGrid sizes={opts.sizes} value={size} onChange={setSize} />
          </section>
        )}

        <section className="flex items-center justify-between rounded-lg border border-border p-3">
          <p className="text-sm font-semibold">
            {opts?.kind === "size" ? "2. Quantidade" : "Quantidade"}
          </p>
          <QtyStepper
            value={qty}
            onChange={(n) => {
              setQty(n);
              setPerUnit((prev) => prev.slice(0, n));
            }}
          />
        </section>

        {opts?.kind === "flavor" && (
          <section className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2">
            {qty > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Deseja sabores iguais ou diferentes?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Chip active={mode === "same"} onClick={() => setMode("same")}>
                    Iguais
                  </Chip>
                  <Chip active={mode === "diff"} onClick={() => setMode("diff")}>
                    Diferentes
                  </Chip>
                </div>
              </div>
            )}
            {qty === 1 || mode === "same" ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  {qty > 1 ? `Sabor para as ${qty} unidades` : "Escolha o sabor"}
                </p>
                <FlavorGrid flavors={opts.flavors} value={flavor} onChange={setFlavor} />
              </div>
            ) : (
              Array.from({ length: qty }, (_, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border border-border p-3 animate-in fade-in-0"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Unidade {i + 1}
                  </p>
                  <FlavorGrid
                    compact
                    flavors={opts.flavors}
                    value={perUnit[i]}
                    onChange={(f) =>
                      setPerUnit((prev) => {
                        const next = [...prev];
                        next[i] = f;
                        return next;
                      })
                    }
                  />
                </div>
              ))
            )}
          </section>
        )}

        <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-border bg-card p-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-display text-2xl text-primary">{brl(unit * qty)}</p>
          </div>
          <Button size="lg" disabled={!ready} onClick={confirm}>
            {ready ? "Adicionar ao carrinho" : opts?.kind === "size" ? `Escolha ${optionLabel === "marca" ? "a marca" : optionLabel === "sabor" ? "o sabor" : "o tamanho"}` : "Escolha o sabor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AddToCartButton({
  product,
  children,
  size,
}: {
  product: Product;
  children: ReactNode;
  size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <AddToCartDialog product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}
