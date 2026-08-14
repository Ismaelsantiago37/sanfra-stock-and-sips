import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Flame, MapPin, Truck } from "lucide-react";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { categories } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adega do Sanfra — whisky, cervejas e importados no bairro" },
      {
        name: "description",
        content:
          "Peça whisky, black label, cervejas, licores e bebidas importadas geladas com entrega rápida na sua região.",
      },
      { property: "og:title", content: "Adega do Sanfra" },
      {
        property: "og:description",
        content: "Whisky, cervejas, licores e importados gelados com entrega no bairro.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { products, promotions } = useApp();
  const destaques = promotions.filter((p) => p.active && p.featured).slice(0, 3);
  const maisPedidos = [...products].sort((a, b) => b.timesOrdered - a.timesOrdered).slice(0, 8);

  return (
    <SiteLayout>
      <section className="bg-night border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <Badge className="mb-4">Entrega em até 40 min</Badge>
            <h1 className="font-display text-4xl leading-none sm:text-6xl">
              A adega do bairro que <span className="text-primary">entrega gelado</span> na sua
              porta
            </h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Whisky, black label, cervejas, licores e importados selecionados. Preço de balcão,
              atendimento de vizinho.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/produtos">Ver produtos</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/promocoes">Promoções da semana</Link>
              </Button>
            </div>
            <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Entrega própria
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Aberto até 02h
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Só no bairro
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {maisPedidos.slice(0, 4).map((p) => (
              <img
                key={p.id}
                src={p.image}
                alt={p.name}
                width={400}
                height={300}
                className="h-36 w-full rounded-xl border border-border object-cover sm:h-48"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl">Categorias</h2>
        <div className="scrollbar-none mt-4 flex gap-3 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/produtos"
              search={{ cat: c.id }}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-primary/60"
            >
              <span>{c.emoji}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {destaques.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <Flame className="h-5 w-5 text-primary" /> Promoções em destaque
            </h2>
            <Link to="/promocoes" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((promo) => {
              const product = products.find((p) => p.id === promo.productId);
              if (!product) return null;
              return (
                <article
                  key={promo.id}
                  className="glow-yellow overflow-hidden rounded-xl border border-primary/40 bg-card"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={600}
                    height={300}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="font-display text-lg">{promo.title}</p>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                    <p className="mt-2">
                      <span className="text-sm text-muted-foreground line-through">
                        {brl(promo.oldPrice)}
                      </span>{" "}
                      <span className="font-display text-2xl text-primary">
                        {brl(promo.newPrice)}
                      </span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-display text-2xl">Mais pedidos da adega</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {maisPedidos.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
