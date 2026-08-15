import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProdutosSearch = { cat?: string | undefined };

export const Route = createFileRoute("/produtos")({
  validateSearch: (search: Record<string, unknown>): ProdutosSearch =>
    typeof search['cat'] === "string" ? { cat: search['cat'] } : {},
  head: () => ({
    meta: [
      { title: "Produtos — Adega do Sanfra" },
      {
        name: "description",
        content:
          "Catálogo completo da Adega do Sanfra: whisky, cervejas, importados, licores, energéticos e gelo.",
      },
      { property: "og:title", content: "Produtos — Adega do Sanfra" },
      { property: "og:description", content: "Whisky, cervejas, importados e licores gelados." },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const { cat } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { products } = useApp();
  const [q, setQ] = useState("");

  const list = products.filter((p) => {
    const okCat = !cat || p.categoryId === (cat as CategoryId);
    const okQ = p.name.toLowerCase().includes(q.toLowerCase().trim());
    return p.active && okCat && okQ;
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl">Produtos</h1>
        <p className="text-sm text-muted-foreground">
          {list.length} itens disponíveis para entrega ou retirada.
        </p>

        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome (ex: black label)"
            className="pl-9"
          />
        </div>

        <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => navigate({ search: {} })}
            className={cn(
              "shrink-0 rounded-full border border-border px-4 py-2 text-sm",
              !cat && "border-primary text-primary",
            )}
          >
            Tudo
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ search: { cat: c.id } })}
              className={cn(
                "shrink-0 rounded-full border border-border px-4 py-2 text-sm",
                cat === c.id && "border-primary text-primary",
              )}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado com esse filtro.
          </p>
        )}
      </div>
    </SiteLayout>
  );
}
