import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { useApp, usePriceOf } from "@/lib/store";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useApp();
  const priceOf = usePriceOf();
  const { price, oldPrice } = priceOf(product.id);
  const off = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {off > 0 && <Badge className="absolute left-2 top-2">-{off}%</Badge>}
        {product.stock <= 20 && (
          <Badge variant="outline" className="absolute right-2 top-2 bg-background/80 text-xs">
            Últimas {product.stock}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        {product.rental && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Por hora</span>
              <span className="font-medium text-primary">{brl(product.rental.hourly)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diária</span>
              <span className="font-medium text-primary">{brl(product.rental.daily)}</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              Devolução fora do prazo combinado gera juros de{" "}
              <strong className="text-primary">{product.rental.lateInterestPercent}% ao dia</strong>{" "}
              sobre o valor do aluguel. Fumando aqui na adega, você ganha{" "}
              <strong className="text-primary">{product.rental.onSiteDiscountPercent}% de desconto</strong>{" "}
              em vez de alugar para levar.
            </p>
          </div>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            {oldPrice && (
              <p className="text-xs text-muted-foreground line-through">{brl(oldPrice)}</p>
            )}
            <p className="font-display text-xl text-primary">{brl(price)}</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              addToCart(product.id);
              toast.success("Adicionado ao carrinho", { description: product.name });
            }}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}
