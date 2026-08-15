import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Adega do Sanfra" },
      {
        name: "description",
        content: "Acesse sua conta de cliente ou o painel do dono da Adega do Sanfra.",
      },
      { property: "og:title", content: "Entrar — Adega do Sanfra" },
      { property: "og:description", content: "Acesse sua conta na Adega do Sanfra." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("cliente@adega.com");
  const [password, setPassword] = useState("123456");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      toast.success(`Bem-vindo, ${user.name}`);
      navigate({ to: user.role === "ADMIN" ? "/admin" : "/" });
    } catch {
      toast.error("E-mail não encontrado", { description: "Use um dos acessos de demonstração." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-display text-3xl">Entrar</h1>
        <p className="text-sm text-muted-foreground">Acesso do cliente e do dono da adega.</p>

        <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Acessos de demonstração</p>
          <p className="mt-1">Cliente: cliente@adega.com</p>
          <p>Dono (admin): admin@adega.com</p>
          <p className="mt-1">Senha: qualquer uma</p>
        </div>
      </div>
    </SiteLayout>
  );
}
