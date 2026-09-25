import { Check, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brl } from "@/lib/format";
import { comboPrice } from "@/lib/store";
import type { ComboSelection, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Chip } from "./VariationPickers";

const zero = (list: string[]) => Object.fromEntries(list.map((f) => [f, 0]));
const total = (c: Record<string, number>) => Object.values(c).reduce((s, n) => s + n, 0);

export function ComboDialog({
  product,
  open,
  onOpenChange,
  initial,
  onConfirm,
  confirmLabel = "Adicionar ao carrinho",
}: {
  product: Product;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: ComboSelection | undefined;
  onConfirm: (sel: ComboSelection) => void;
  confirmLabel?: string;
}) {
  const opts = product.options;
  const [step, setStep] = useState(1);
  const [whisky, setWhisky] = useState<string | undefined>();
  const [energ, setEnerg] = useState<Record<string, number>>({});
  const [gelos, setGelos] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open || opts?.kind !== "combo") return;
    setStep(1);
    setWhisky(initial?.whisky);
    setEnerg({ ...zero(opts.energeticos), ...(initial?.energeticos ?? {}) });
    setGelos({ ...zero(opts.gelos), ...(initial?.gelos ?? {}) });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (opts?.kind !== "combo") return null;
  const off = (p: number) => Math.round(p * (1 - opts.whiskyDiscountPercent / 100) * 100) / 100;
  const price = whisky ? comboPrice(opts, { whisky, energeticos: energ, gelos }) : null;

  const canNext =
    step === 1 ? !!whisky : step === 2 ? total(energ) === opts.energeticoQty : total(gelos) === opts.geloQty;

  const steps = ["Whisky", "Energéticos", "Gelos"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{product.name}</DialogTitle>
          <DialogDescription>Monte seu combo em 3 passos.</DialogDescription>
        </DialogHeader>

        <ol className="grid grid-cols-3 gap-2">
          {steps.map((s, i) => (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors",
                step === i + 1
                  ? "border-primary text-primary"
                  : step > i + 1
                    ? "border-primary/40 text-muted-foreground"
                    : "border-border text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  step > i + 1 ? "bg-primary text-primary-foreground" : "border border-current",
                )}
              >
                {step > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        <div key={step} className="space-y-3 animate-in fade-in-0 slide-in-from-right-4 duration-300">
          {step === 1 && (
            <>
              <p className="text-sm font-semibold">Passo 1: escolha 1 whisky (5% OFF no combo)</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {opts.whiskies.map((w) => (
                  <Chip key={w.label} active={whisky === w.label} onClick={() => setWhisky(w.label)}>
                    <span className="block text-sm">{w.label}</span>
                    <span className="mt-1 flex items-baseline gap-2">
                      <span className="text-xs line-through opacity-70">{brl(w.price)}</span>
                      <span className={cn("text-sm font-bold", whisky === w.label ? "" : "text-primary")}>
                        {brl(off(w.price))}
                      </span>
                    </span>
                  </Chip>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <Counters
              title="Passo 2: escolha 3 Red Bull"
              list={opts.energeticos}
              value={energ}
              onChange={setEnerg}
              max={opts.energeticoQty}
            />
          )}
          {step === 3 && (
            <Counters
              title="Passo 3: escolha 3 gelos saborizados"
              list={opts.gelos}
              value={gelos}
              onChange={setGelos}
              max={opts.geloQty}
            />
          )}
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-border bg-card p-4">
          <div>
            <p className="text-xs text-muted-foreground">Total do combo</p>
            <p className="font-display text-2xl text-primary">{price !== null ? brl(price) : "—"}</p>
          </div>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            <Button
              size="lg"
              disabled={!canNext}
              onClick={() => {
                if (step < 3) setStep(step + 1);
                else if (whisky) {
                  onConfirm({ whisky, energeticos: energ, gelos });
                  onOpenChange(false);
                }
              }}
            >
              {step < 3 ? "Próximo passo" : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Counters({
  title,
  list,
  value,
  onChange,
  max,
}: {
  title: string;
  list: string[];
  value: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
  max: number;
}) {
  const sum = total(value);
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-bold transition-colors",
            sum === max ? "border-primary bg-primary text-primary-foreground" : "border-border",
          )}
        >
          Selecionados: {sum}/{max}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {list.map((f) => {
          const n = value[f] ?? 0;
          return (
            <div
              key={f}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
                n > 0 ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <span className="text-sm font-medium">{f}</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={n === 0}
                  onClick={() => onChange({ ...value, [f]: n - 1 })}
                  aria-label={`Menos ${f}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-6 text-center font-display text-lg">{n}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={sum >= max}
                  onClick={() => onChange({ ...value, [f]: n + 1 })}
                  aria-label={`Mais ${f}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
