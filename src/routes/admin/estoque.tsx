import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Boxes, PackageX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/mock-data";
import { useApp, variantLabels } from "@/lib/store";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — Adega do Sanfra" },
      { name: "description", content: "Controle de unidades disponíveis por produto, sabor e marca." },
      { property: "og:title", content: "Estoque — Adega do Sanfra" },
      { property: "og:description", content: "Atualize o estoque e ele aparece na hora para os clientes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminEstoque,
});

function AdminEstoque() {
  const { products } = useApp();
  const [q, setQ] = useState("");
  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const esgotados = products.filter((p) => p.stock <= 0).length;
  const baixos = products.filter((p) => p.stock > 0 && p.stock <= 20).length;
  const variacoesFalta = products.reduce(
    (s, p) => s + Object.values(p.variantStock ?? {}).filter((n) => n <= 0).length,
    0,
  );

  return (
    <AdminLayout title="Estoque" description="O que você salvar aqui aparece na hora para os clientes">
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Produtos esgotados" value={String(esgotados)} icon={PackageX} tone="negative" />
        <Kpi label="Estoque baixo (≤ 20)" value={String(baixos)} icon={AlertTriangle} />
        <Kpi label="Sabores/marcas em falta" value={String(variacoesFalta)} icon={Boxes} />
      </div>
      <Panel title="Unidades disponíveis" className="mt-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto" className="mb-3 max-w-sm" />
        <ul className="space-y-2">
          {list.map((p) => (
            <StockRow key={p.id} product={p} />
          ))}
        </ul>
      </Panel>
    </AdminLayout>
  );
}

function StockRow({ product }: { product: Product }) {
  const { saveProduct } = useApp();
  const labels = variantLabels(product);
  const [total, setTotal] = useState(String(product.stock));
  const [vs, setVs] = useState<Record<string, string>>(() =>
    Object.fromEntries(labels.map((l) => [l, String(product.variantStock?.[l] ?? 0)])),
  );

  // ⚠️ SALVAR ESTOQUE: grava o novo valor no estado global da loja (saveProduct).
  // A partir daqui o selo "Últimas X", o aviso "em falta" e o limite do carrinho
  // dos clientes passam a usar este número.
  const save = () => {
    if (labels.length) {
      const variantStock = Object.fromEntries(
        labels.map((l) => [l, Math.max(0, Math.floor(Number(vs[l]) || 0))]),
      );
      saveProduct({ ...product, variantStock });
    } else {
      saveProduct({ ...product, stock: Math.max(0, Math.floor(Number(total) || 0)) });
    }
    toast.success("Estoque atualizado", { description: product.name });
  };

  return (
    <li className="rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-3">
        <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {categories.find((c) => c.id === product.categoryId)?.name}
          </p>
        </div>
        {product.stock <= 0 ? (
          <Badge variant="destructive">Esgotado</Badge>
        ) : (
          <Badge variant="outline">{product.stock} un.</Badge>
        )}
        {!labels.length && (
          <Input
            type="number"
            min={0}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="h-9 w-24 text-right"
            aria-label={`Estoque de ${product.name}`}
          />
        )}
        <Button size="sm" onClick={save}>Salvar</Button>
      </div>
      {labels.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {labels.map((l) => (
            <label key={l} className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-2 py-1.5 text-xs">
              <span className={Number(vs[l]) <= 0 ? "text-destructive" : ""}>{l}</span>
              <Input
                type="number"
                min={0}
                value={vs[l] ?? "0"}
                onChange={(e) => setVs((p) => ({ ...p, [l]: e.target.value }))}
                className="h-8 w-20 text-right"
              />
            </label>
          ))}
        </div>
      )}
    </li>
  );
}
