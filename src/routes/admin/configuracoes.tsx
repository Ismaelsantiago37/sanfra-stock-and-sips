import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Panel } from "@/components/admin/Kpi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações da loja — Adega do Sanfra" },
      {
        name: "description",
        content: "Horários, taxa de entrega, raio de atendimento e dados de contato da adega.",
      },
      { property: "og:title", content: "Configurações da loja — Adega do Sanfra" },
      { property: "og:description", content: "Ajustes operacionais da Adega do Sanfra." },
    ],
  }),
  component: AdminConfiguracoes,
});

function AdminConfiguracoes() {
  const [aberta, setAberta] = useState(true);
  const [aceitaFiado, setAceitaFiado] = useState(true);

  return (
    <AdminLayout title="Configurações" description="Dados da loja, entrega e pagamento">
      <form
        className="grid gap-4 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Configurações salvas");
        }}
      >
        <Panel title="Dados da adega">
          <div className="space-y-3">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" defaultValue="Adega do Sanfra" />
            </div>
            <div>
              <Label htmlFor="tel">WhatsApp</Label>
              <Input id="tel" defaultValue="(11) 98888-1234" />
            </div>
            <div>
              <Label htmlFor="end">Endereço</Label>
              <Textarea id="end" defaultValue="Rua São Francisco, 120 — Centro" />
            </div>
          </div>
        </Panel>

        <Panel title="Funcionamento">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="abre">Abre às</Label>
                <Input id="abre" type="time" defaultValue="16:00" />
              </div>
              <div>
                <Label htmlFor="fecha">Fecha às</Label>
                <Input id="fecha" type="time" defaultValue="02:00" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm">Loja aceitando pedidos</span>
              <Switch checked={aberta} onCheckedChange={setAberta} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm">Permitir pagamento pendente (fiado)</span>
              <Switch checked={aceitaFiado} onCheckedChange={setAceitaFiado} />
            </div>
          </div>
        </Panel>

        <Panel title="Entrega">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="taxa">Taxa de entrega (R$)</Label>
              <Input id="taxa" type="number" step="0.5" defaultValue={6} />
            </div>
            <div>
              <Label htmlFor="raio">Raio de atendimento (km)</Label>
              <Input id="raio" type="number" defaultValue={4} />
            </div>
            <div>
              <Label htmlFor="min">Pedido mínimo (R$)</Label>
              <Input id="min" type="number" defaultValue={25} />
            </div>
            <div>
              <Label htmlFor="eta">Tempo médio (min)</Label>
              <Input id="eta" type="number" defaultValue={35} />
            </div>
          </div>
        </Panel>

        <Panel title="Fidelidade">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pts">Pontos por R$ 1</Label>
              <Input id="pts" type="number" defaultValue={1} />
            </div>
            <div>
              <Label htmlFor="vip">Pontos para VIP</Label>
              <Input id="vip" type="number" defaultValue={500} />
            </div>
            <div>
              <Label htmlFor="black">Pontos para Black</Label>
              <Input id="black" type="number" defaultValue={1500} />
            </div>
          </div>
        </Panel>

        <div className="lg:col-span-2">
          <Button type="submit">Salvar configurações</Button>
        </div>
      </form>
    </AdminLayout>
  );
}
