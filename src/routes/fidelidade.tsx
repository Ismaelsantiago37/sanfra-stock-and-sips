import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Crown, Ticket } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dateBR } from "@/lib/format";
import { coupons } from "@/lib/mock-data";
import { levelPerks, nextLevel, useApp } from "@/lib/store";

export const Route = createFileRoute("/fidelidade")({
  head: () => ({
    meta: [
      { title: "Fidelidade — Adega do Sanfra" },
      {
        name: "description",
        content: "Acompanhe seus pontos, nível de cliente e cupons liberados na Adega do Sanfra.",
      },
      { property: "og:title", content: "Fidelidade — Adega do Sanfra" },
      { property: "og:description", content: "Pontos, níveis e cupons exclusivos." },
    ],
  }),
  component: Fidelidade,
});

const order = { CLIENTE: 0, VIP: 1, BLACK: 2 } as const;

function Fidelidade() {
  const { customer } = useApp();

  if (!customer) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-muted-foreground">Entre na sua conta para ver sua fidelidade.</p>
          <Button asChild className="mt-4">
            <Link to="/entrar">Entrar</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const next = nextLevel[customer.level];
  const progress = next ? Math.min(100, (customer.points / next.points) * 100) : 100;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl">
          <Crown className="h-6 w-6 text-primary" /> Minha fidelidade
        </h1>

        <section className="glow-yellow mt-6 rounded-xl border border-primary/40 bg-night p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Seu nível</p>
              <p className="font-display text-4xl text-primary">{customer.level}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Pontos</p>
              <p className="font-display text-3xl">{customer.points}</p>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {next
              ? `Faltam ${Math.max(0, next.points - customer.points)} pontos para o nível ${next.level}.`
              : "Você está no nível máximo da adega. Respeito."}
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {(["CLIENTE", "VIP", "BLACK"] as const).map((lvl) => (
            <div
              key={lvl}
              className="rounded-xl border border-border bg-card p-4 data-[on=true]:border-primary/60"
              data-on={order[customer.level] >= order[lvl]}
            >
              <p className="font-display text-xl">{lvl}</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {levelPerks[lvl].map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-2xl">
            <Ticket className="h-5 w-5 text-primary" /> Meus cupons
          </h2>
          <div className="mt-4 space-y-3">
            {coupons.map((c) => {
              const unlocked = order[customer.level] >= order[c.minLevel];
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-display text-lg text-primary">{c.code}</p>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <p className="text-xs text-muted-foreground">Válido até {dateBR(c.expiresAt)}</p>
                  </div>
                  <Badge variant={unlocked ? "default" : "outline"}>
                    {unlocked ? "Liberado" : `Nível ${c.minLevel}`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
