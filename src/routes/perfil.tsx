import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { brl, dateBR } from "@/lib/format";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Adega do Sanfra" },
      {
        name: "description",
        content: "Dados de contato, endereço de entrega e histórico de compras na adega.",
      },
      { property: "og:title", content: "Meu perfil — Adega do Sanfra" },
      { property: "og:description", content: "Seus dados e histórico na Adega do Sanfra." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { user, customer, logout, orders } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-muted-foreground">Você não está conectado.</p>
          <Button asChild className="mt-4">
            <Link to="/entrar">Entrar</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const mine = orders.filter((o) => o.customerId === user.customerId);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl">
          <UserIcon className="h-6 w-6 text-primary" /> Meu perfil
        </h1>

        <section className="mt-6 space-y-2 rounded-xl border border-border bg-card p-5 text-sm">
          <p className="font-display text-2xl">{user.name}</p>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-muted-foreground">{user.phone}</p>
          {customer && (
            <>
              <p className="text-muted-foreground">{customer.address}</p>
              <p className="text-muted-foreground">Cliente desde {dateBR(customer.createdAt)}</p>
            </>
          )}
        </section>

        {customer && (
          <section className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="font-display text-2xl text-primary">{mine.length || customer.ordersCount}</p>
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="font-display text-2xl text-primary">{brl(customer.totalSpent)}</p>
              <p className="text-xs text-muted-foreground">Total gasto</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="font-display text-2xl text-primary">{customer.level}</p>
              <p className="text-xs text-muted-foreground">Nível</p>
            </div>
          </section>
        )}

        {user.role === "ADMIN" && (
          <Button asChild className="mt-6 w-full" size="lg">
            <Link to="/admin">
              <ShieldCheck className="h-4 w-4" /> Abrir painel do dono
            </Link>
          </Button>
        )}

        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4" /> Sair da conta
        </Button>
      </div>
    </SiteLayout>
  );
}
