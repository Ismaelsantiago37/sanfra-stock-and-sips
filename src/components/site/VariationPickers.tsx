import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Chip({
  active,
  onClick,
  children,
  className,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all duration-200",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_-4px_var(--primary)]"
          : "border-border bg-card hover:border-primary/60",
        disabled && "cursor-not-allowed opacity-45 hover:border-border",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Diminuir"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-10 text-center font-display text-xl">{value}</span>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Aumentar"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StockHint({ left }: { left: number | undefined }) {
  if (left === undefined) return null;
  if (left <= 0) return <span className="block text-[11px] text-destructive">Está em falta no momento</span>;
  return <span className="block text-[11px] opacity-80">{left} disponíveis</span>;
}

export function FlavorGrid({
  flavors,
  value,
  onChange,
  compact,
  available,
}: {
  flavors: string[];
  value: string | undefined;
  onChange: (f: string) => void;
  compact?: boolean;
  /** unidades disponíveis por sabor (opcional) */
  available?: (f: string) => number;
}) {
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
      {flavors.map((f) => (
        <Chip
          key={f}
          active={value === f}
          disabled={value !== f && available !== undefined && available(f) <= 0}
          onClick={() => onChange(f)}
        >
          <span className="block">{f}</span>
          <StockHint left={available?.(f)} />
        </Chip>
      ))}
    </div>
  );
}

export function SizeGrid({
  sizes,
  value,
  onChange,
  available,
}: {
  sizes: { label: string; price: number }[];
  value: string | undefined;
  onChange: (s: string) => void;
  available?: (s: string) => number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {sizes.map((s) => (
        <Chip
          key={s.label}
          active={value === s.label}
          disabled={value !== s.label && available !== undefined && available(s.label) <= 0}
          onClick={() => onChange(s.label)}
        >
          <span className="block">{s.label}</span>
          <span className={cn("block text-sm font-bold", value === s.label ? "" : "text-primary")}>
            {brl(s.price)}
          </span>
          <StockHint left={available?.(s.label)} />
        </Chip>
      ))}
    </div>
  );
}
