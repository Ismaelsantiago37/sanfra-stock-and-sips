import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brl, dateBR } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/promocoes")({
  head: () => ({
    meta: [
      { title: "Promoções — Adega do Sanfra" },
      {
        name: "description",
        content: "Crie, ative e acompanhe as ofertas relâmpago e descontos da adega.",
      },
      { property: "og:title", content: "Promoções — Adega do Sanfra" },
      { property: "og:description", content: "Gestão das ofertas ativas da adega." },
    ],
  }),
  component: AdminPromocoes,
});

function AdminPromocoes() {
  const { promotions, products, savePromotion, removePromotion } = useApp();
  const ativas = promotions.filter((p) => p.active).length;
  const descontoMedio =
    promotions.reduce((s, p) => s + (1 - p.newPrice / p.oldPrice) * 100, 0) /
    Math.max(promotions.length, 1);

  return (
    <AdminLayout title="Promoções" description="Ofertas em destaque na loja">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Promoções ativas" value={String(ativas)} icon={Tag} tone="positive" />
        <Kpi label="Cadastradas" value={String(promotions.length)} />
        <Kpi label="Desconto médio" value={`${descontoMedio.toFixed(0)}%`} />
        <Kpi label="Em destaque" value={String(promotions.filter((p) => p.featured).length)} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {promotions.map((p) => {
          const prod = products.find((x) => x.id === p.productId);
          return (
            <Panel key={p.id} title={p.title} description={prod?.name ?? "Produto removido"}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={p.active ? "secondary" : "outline"}>
                  {p.active ? "Ativa" : "Pausada"}
                </Badge>
                {p.featured && <Badge variant="outline">Destaque</Badge>}
                <Badge variant="outline">Até {dateBR(p.expiresAt)}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-through">{brl(p.oldPrice)}</p>
              <p className="font-display text-2xl text-primary">{brl(p.newPrice)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.availableQty === null ? "Estoque livre" : `${p.availableQty} unidades na oferta`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => savePromotion({ ...p, active: !p.active })}>
                  {p.active ? "Pausar" : "Ativar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => savePromotion({ ...p, featured: !p.featured })}
                >
                  {p.featured ? "Tirar destaque" : "Destacar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removePromotion(p.id)}>
                  Excluir
                </Button>
              </div>
            </Panel>
          );
        })}
      </div>
    </AdminLayout>
  );
}
