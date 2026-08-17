import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Wallet } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brl, dateBR } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/pendentes")({
  head: () => ({
    meta: [
      { title: "Valores pendentes — Adega do Sanfra" },
      {
        name: "description",
        content: "Controle do fiado: quem deve, quanto deve e quais cobranças estão atrasadas.",
      },
      { property: "og:title", content: "Valores pendentes — Adega do Sanfra" },
      { property: "og:description", content: "Contas a receber e cobranças da adega." },
    ],
  }),
  component: AdminPendentes,
});

function AdminPendentes() {
  const { pendings, setPendingStatus } = useApp();
  const aReceber = pendings.filter((p) => p.status !== "PAGO").reduce((s, p) => s + p.amount, 0);
  const atrasado = pendings.filter((p) => p.status === "ATRASADO").reduce((s, p) => s + p.amount, 0);
  const recebido = pendings.filter((p) => p.status === "PAGO").reduce((s, p) => s + p.amount, 0);

  return (
    <AdminLayout title="Valores pendentes" description="Fiado registrado apenas em vendas presenciais no balcão">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="A receber" value={brl(aReceber)} icon={Wallet} />
        <Kpi label="Em atraso" value={brl(atrasado)} icon={AlertTriangle} tone="negative" />
        <Kpi label="Já quitado" value={brl(recebido)} icon={CheckCircle2} tone="positive" />
        <Kpi label="Clientes com pendência" value={String(new Set(pendings.filter((p) => p.status !== "PAGO").map((p) => p.customerId)).size)} />
      </div>

      <p className="mt-4 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm text-muted-foreground">
        Só entram aqui as compras feitas <strong className="text-foreground">presencialmente no
        balcão</strong>. Pedidos pelo site exigem pagamento na hora (Pix, cartão ou dinheiro), então
        não geram valor pendente.
      </p>

      <Panel title="Cobranças presenciais" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Cliente</th>
                <th className="py-2">Pedido</th>
                <th className="py-2">Vencimento</th>
                <th className="py-2 text-right">Valor</th>
                <th className="py-2 text-right">Status</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pendings.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2">{p.customerName}</td>
                  <td className="py-2 text-muted-foreground">#{p.orderNumber}</td>
                  <td className="py-2 text-muted-foreground">{dateBR(p.dueDate)}</td>
                  <td className="py-2 text-right">{brl(p.amount)}</td>
                  <td className="py-2 text-right">
                    <Badge
                      variant={
                        p.status === "PAGO"
                          ? "secondary"
                          : p.status === "ATRASADO"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPendingStatus(p.id, "PAGO")}>
                        Marcar pago
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPendingStatus(p.id, "ATRASADO")}>
                        Atrasado
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
