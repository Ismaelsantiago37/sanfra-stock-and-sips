import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Clock,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Logo } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const menu = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/promocoes", label: "Promoções", icon: Tag },
  { to: "/admin/fidelidade", label: "Fidelidade", icon: Crown },
  { to: "/admin/pendentes", label: "Valores Pendentes", icon: Wallet },
  { to: "/admin/metricas", label: "Métricas", icon: BarChart3 },
  { to: "/admin/pico", label: "Horários de Pico", icon: Clock },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

function MenuList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {menu.map((item) => {
        const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
              active && "bg-sidebar-accent font-medium text-primary",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AdminBell() {
  const { notifications, markAllRead } = useApp();
  const mine = notifications.filter((n) => n.audience === "ADMIN");
  const unread = mine.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Alertas da operação</p>
          <button onClick={() => markAllRead("ADMIN")} className="text-xs text-primary hover:underline">
            Marcar lidas
          </button>
        </div>
        <div className="max-h-80 overflow-auto">
          {mine.map((n) => (
            <div key={n.id} className="border-b px-4 py-3 last:border-0">
              <p className={cn("text-sm font-medium", n.tone === "warning" && "text-primary")}>
                {n.title}
              </p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AdminLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { logout, user } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="border-b border-sidebar-border px-4 py-4">
          <Logo />
        </div>
        <MenuList />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0">
                <div className="border-b border-sidebar-border px-4 py-4">
                  <Logo />
                </div>
                <MenuList onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <AdminBell />
            <span className="hidden text-xs text-muted-foreground sm:block">{user?.name}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <div className="min-w-0 flex-1 p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
