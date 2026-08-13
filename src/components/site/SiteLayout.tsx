import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Crown,
  Home,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  Tag,
  User as UserIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import logo from "@/assets/logo-adega.webp.asset.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Início", icon: Home },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/promocoes", label: "Promoções", icon: Tag },
  { to: "/carrinho", label: "Meu Carrinho", icon: ShoppingCart },
  { to: "/pedidos", label: "Meus Pedidos", icon: Receipt },
  { to: "/fidelidade", label: "Minha Fidelidade", icon: Crown },
  { to: "/perfil", label: "Perfil", icon: UserIcon },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2">
      <img
        src={logo.url}
        alt="Adega do Bairro"
        width={44}
        height={44}
        className="h-10 w-10 shrink-0 rounded-full object-contain"
      />
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className="block font-display text-lg text-foreground">Adega do Bairro</span>
          <span className="block text-[10px] tracking-widest text-primary">DO BAIRRO PRO SEU ROLÊ</span>
        </span>
      )}
    </Link>
  );
}

function NotificationsBell() {
  const { notifications, markAllRead } = useApp();
  const mine = notifications.filter((n) => n.audience === "CUSTOMER");
  const unread = mine.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notificações</p>
          <button
            onClick={() => markAllRead("CUSTOMER")}
            className="text-xs text-primary hover:underline"
          >
            Marcar lidas
          </button>
        </div>
        <div className="max-h-80 overflow-auto">
          {mine.map((n) => (
            <div key={n.id} className="border-b px-4 py-3 last:border-0">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
            </div>
          ))}
          {mine.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nada por aqui ainda.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { cartCount, user } = useApp();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-1">
            <nav className="mr-2 hidden items-center gap-1 lg:flex">
              {nav.slice(0, 3).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    pathname === item.to && "text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <NotificationsBell />
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/carrinho" aria-label="Carrinho">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="border-b px-5 py-4">
                  <Logo />
                </div>
                <nav className="flex flex-col p-3">
                  {nav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted",
                        pathname === item.to && "bg-muted text-primary",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-3 border-t pt-3">
                    {user?.role === "ADMIN" ? (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-primary"
                      >
                        <Crown className="h-4 w-4" /> Painel administrativo
                      </Link>
                    ) : (
                      <Link
                        to="/entrar"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground"
                      >
                        <UserIcon className="h-4 w-4" /> {user ? "Minha conta" : "Entrar"}
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      <footer className="border-t border-border/70 bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Adega de bairro com delivery próprio, promoções de verdade e fidelidade que vale a
              pena.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-display text-base text-primary">Funcionamento</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>Seg a Qui — 10h às 00h</li>
              <li>Sex e Sáb — 10h às 02h</li>
              <li>Domingo — 12h às 22h</li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-display text-base text-primary">Contato</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>WhatsApp: (11) 90000-1111</li>
              <li>contato@adegadobairro.com.br</li>
              <li>Rua das Palmeiras, 100 — Jardim Alvorada</li>
            </ul>
          </div>
        </div>
        <p className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground">
          Venda proibida para menores de 18 anos. Aprecie com moderação.
        </p>
      </footer>

      {/* Navegação inferior (mobile-first) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        {[nav[0], nav[1], nav[2], nav[4], nav[5]].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[10px] text-muted-foreground",
              pathname === item.to && "text-primary",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label.replace("Minha ", "").replace("Meus ", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
