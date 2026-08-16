import { createFileRoute } from "@tanstack/react-router";
import { Boxes, PackageX, TrendingUp } from "lucide-react";
import { useState } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/format";
import { categories } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos e estoque — Adega do Sanfra" },
      {
        name: "description",
        content: "Cadastro de bebidas, preços, estoque e ativação de itens da adega.",
      },
      { property: "og:title", content: "Produtos e estoque — Adega do Sanfra" },
      { property: "og:description", content: "Controle de catálogo e estoque da adega." },
    ],
  }),
  component: AdminProdutos,
});

function AdminProdutos() {
  const { products, saveProduct, removeProduct } = useApp();
  const [q, setQ] = useState("");
  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const semEstoque = products.filter((p) => p.stock === 0).length;
  const valorEstoque = products.reduce((s, p) => s + p.price * p.stock, 0);
  const maisVendido = [...products].sort((a, b) => b.timesOrdered - a.timesOrdered)[0];

  const patch = (p: Product, changes: Partial<Product>) => saveProduct({ ...p, ...changes });

  return (
    <AdminLayout title="Produtos" description="Catálogo, preços e estoque">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Itens no catálogo" value={String(products.length)} icon={Boxes} />
        <Kpi label="Sem estoque" value={String(semEstoque)} icon={PackageX} tone="negative" />
        <Kpi label="Valor em estoque" value={brl(valorEstoque)} tone="positive" />
        <Kpi label="Campeão de vendas" value={maisVendido?.name ?? "—"} icon={TrendingUp} />
      </div>

      <Panel title="Catálogo" className="mt-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar produto"
          className="mb-3 max-w-sm"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Produto</th>
                <th className="py-2">Categoria</th>
                <th className="py-2 text-right">Preço</th>
                <th className="py-2 text-right">Estoque</th>
                <th className="py-2 text-right">Vendas</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2">
                    <span className="font-medium">{p.name}</span>
                    {!p.active && (
                      <Badge variant="outline" className="ml-2">
                        inativo
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {categories.find((c) => c.id === p.categoryId)?.name ?? p.categoryId}
                  </td>
                  <td className="py-2 text-right">
                    <Input
                      type="number"
                      value={p.price}
                      onChange={(e) => patch(p, { price: Number(e.target.value) })}
                      className="ml-auto h-8 w-24 text-right"
                    />
                  </td>
                  <td className="py-2 text-right">
                    <Input
                      type="number"
                      value={p.stock}
                      onChange={(e) => patch(p, { stock: Number(e.target.value) })}
                      className="ml-auto h-8 w-20 text-right"
                    />
                  </td>
                  <td className="py-2 text-right">{p.timesOrdered}</td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => patch(p, { active: !p.active })}>
                        {p.active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeProduct(p.id)}>
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminLayout>
  );
}
