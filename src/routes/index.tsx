import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Crown, Flame, MapPin, Store, Truck } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/mock-data";
import { levelPerks, useApp } from "@/lib/store";

import { Map3D } from "@/components/site/Map3D";
import heroNarguile from "@/assets/hero-narguile.jpg.asset.json";
import heroHeineken from "@/assets/hero-heineken.jpg.asset.json";
import heroCoca from "@/assets/hero-coca.jpg.asset.json";

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
  const { products } = useApp();
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

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="flex items-center gap-2 font-display text-2xl">
          <MapPin className="h-5 w-5 text-primary" /> Onde estamos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Passe aqui e retire seu pedido no balcão — sem taxa de entrega.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Map3D />
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-display text-xl">Adega do Sanfra</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Rua das Mangueiras, 214 — Vila Sanfra
              <br />
              Esquina com a Av. do Mercado, ao lado da padaria.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Seg a dom, das 10h às 02h
              </li>
              <li className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" /> Retirada pronta em ~20 min
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Entrega em até 40 min no bairro
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Mapa meramente ilustrativo, sem endereço real.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/checkout">Pedir para retirada</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="flex items-center gap-2 font-display text-2xl">
          <Flame className="h-5 w-5 text-primary" /> Narguilé & essências
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Além das bebidas, a adega monta, vende e aluga narguilé — com rosh, carvão e essências de
          vários sabores.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="overflow-hidden rounded-xl border border-border bg-card">
            <img
              src={narguileFoto.url}
              alt="Narguilé completo montado no balcão da Adega do Sanfra"
              loading="lazy"
              width={800}
              height={1000}
              className="h-60 w-full object-cover"
            />
            <div className="p-4">
              <p className="font-display text-xl">Aluguel por hora ou por diária</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Narguilé completo: R$ 25/hora ou R$ 79,90 na diária</li>
                <li>• Premium de vidro: R$ 39,90/hora ou R$ 119,90 na diária</li>
                <li>• Vendemos também rosh de barro e silicone, mangueira e carvão de coco</li>
              </ul>
              <p className="mt-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs text-muted-foreground">
                Atenção: se o narguilé não voltar dentro do prazo combinado, é cobrado juros de
                atraso de <strong className="text-primary">10% a 12% ao dia</strong> sobre o valor do
                aluguel.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Prefere fumar aqui na adega? Você ganha{" "}
                <strong className="text-primary">até 25% de desconto</strong> em vez de alugar para
                levar.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/produtos" search={{ cat: "narguile" }}>
                  Ver narguilé e acessórios
                </Link>
              </Button>
            </div>
          </article>

          <article className="overflow-hidden rounded-xl border border-border bg-card">
            <img
              src={essenciasFoto.url}
              alt="Prateleira com caixas de essências de narguilé de vários sabores"
              loading="lazy"
              width={800}
              height={620}
              className="h-60 w-full object-cover"
            />
            <div className="p-4">
              <p className="font-display text-xl">Essências de todos os sabores</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Melancia com menta, uva verde, maracujá, menta ice, chiclete, blueberry, limão
                siciliano e mais — nacionais e importadas, de R$ 19,90 a R$ 27,90. Tem combo com 3
                sabores à escolha.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Venda proibida para menores de 18 anos. O consumo de tabaco faz mal à saúde.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link to="/produtos" search={{ cat: "essencias" }}>
                  Ver essências
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="flex items-center gap-2 font-display text-2xl">
          <Crown className="h-5 w-5 text-primary" /> Como funciona a Fidelidade
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A cada compra você acumula pontos e sobe de nível — quanto mais você pede, mais barato
          fica.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              nivel: "CLIENTE",
              resumo: "Do zero a 499 pontos",
              perks: levelPerks.CLIENTE,
            },
            {
              nivel: "VIP",
              resumo: "A partir de 500 pontos",
              perks: levelPerks.VIP,
            },
            {
              nivel: "BLACK",
              resumo: "A partir de 1.200 pontos",
              perks: levelPerks.BLACK,
            },
          ].map((n) => (
            <article key={n.nivel} className="rounded-xl border border-border bg-card p-4">
              <p className="font-display text-2xl text-primary">{n.nivel}</p>
              <p className="text-xs text-muted-foreground">{n.resumo}</p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {n.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1 ponto a cada R$ 1</strong> gasto em pedidos
            entregues. Os pontos liberam cupons automáticos, e o nível é recalculado a cada compra.
            Fumando narguilé aqui na adega você também pontua e ainda ganha desconto no lugar do
            aluguel.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/fidelidade">Ver meu programa de fidelidade</Link>
          </Button>
        </div>
      </section>

    </SiteLayout>
  );
}
