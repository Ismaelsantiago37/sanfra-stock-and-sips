import { createFileRoute } from "@tanstack/react-router";
import { Clock, Tag } from "lucide-react";

import { AddToCartButton } from "@/components/site/AddToCartDialog";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { brl, dateBR, promotionDiscount } from "@/lib/format";
import { useApp } from "@/lib/store";
import { isPromoLive } from "@/lib/store";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Promocoes,
});

function Promocoes() {
  const { promotions, products } = useApp();
  const list = promotions.filter((p) => isPromoLive(p));

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
            const discount = promotionDiscount(promo.oldPrice, promo.newPrice);
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
                  <Badge className="absolute left-2 top-2">-{discount.percent}%</Badge>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="font-display text-lg">{promo.title}</p>
                  <p className="text-sm text-muted-foreground">{product.name}</p>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 text-sm">
                    <p>
                      <strong>{product.name}</strong>: de <span className="line-through">{brl(promo.oldPrice)}</span>{" "}
                      por <strong className="text-primary">{brl(promo.newPrice)}</strong>
                    </p>
                    <p className="mt-1 text-xs font-semibold text-primary">
                      {discount.percent}% de desconto · Você economiza {brl(discount.amount)}
                    </p>
                  </div>
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
                    <AddToCartButton product={product}>Aproveitar</AddToCartButton>
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
