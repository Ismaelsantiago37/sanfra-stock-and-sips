import { createFileRoute } from "@tanstack/react-router";
import { Clock, Tag } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brl, dateBR } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/promocoes")({
  head: () => ({
    meta: [
      { title: "Promoções — Adega do Sanfra" },
      {
        name: "description",
        content:
          "Ofertas da semana em whisky, cervejas, importados e combos. Descontos válidos enquanto durar o estoque.",
      },
      { property: "og:title", content: "Promoções — Adega do Sanfra" },
      { property: "og:description", content: "Ofertas da semana na Adega do Sanfra." },
    ],
  }),
  component: Promocoes,
});

function Promocoes() {
  const { promotions, products, addToCart } = useApp();
  const list = promotions.filter((p) => p.active);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl">
          <Tag className="h-6 w-6 text-primary" /> Promoções
        </h1>
        <p className="text-sm text-muted-foreground">
          Ofertas com prazo e quantidade limitada — quando acaba, acabou.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((promo) => {
            const product = products.find((p) => p.id === promo.productId);
            if (!product) return null;
            const off = Math.round((1 - promo.newPrice / promo.oldPrice) * 100);
            return (
              <article
                key={promo.id}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={600}
                    height={300}
                    className="h-40 w-full object-cover"
                  />
                  <Badge className="absolute left-2 top-2">-{off}%</Badge>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="font-display text-lg">{promo.title}</p>
                  <p className="text-sm text-muted-foreground">{product.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> Vale até {dateBR(promo.expiresAt)}
                    {promo.availableQty !== null && ` • ${promo.availableQty} un.`}
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">
                        {brl(promo.oldPrice)}
                      </p>
                      <p className="font-display text-2xl text-primary">{brl(promo.newPrice)}</p>
                    </div>
                    <Button
                      onClick={() => {
                        addToCart(product.id);
                        toast.success("Promoção no carrinho", { description: product.name });
                      }}
                    >
                      Aproveitar
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
