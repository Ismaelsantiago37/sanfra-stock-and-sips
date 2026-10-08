import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl } from "@/lib/format";
import type { DoseSelection, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Chip } from "./VariationPickers";

export function DoseDialog({ product, open, onOpenChange, initial, onConfirm, confirmLabel = "Adicionar ao carrinho" }: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: DoseSelection | undefined;
  onConfirm: (selection: DoseSelection) => void;
  confirmLabel?: string;
}) {
  const opts = product.options;
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<Partial<DoseSelection>>({});

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setSelection(initial ?? {});
  }, [open, initial]);

  if (opts?.kind !== "dose") return null;
  const chosenPrice = opts.bebidas.find((item) => item.label === selection.bebida)?.price;
  const ready = step === 1 ? !!selection.bebida : step === 2 ? !!selection.energetico : !!selection.gelo;
  const steps = ["Bebida", "Energético", "Gelo"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Monte sua Dose 700ml</DialogTitle>
          <DialogDescription>Escolha os três itens. Disponível somente para retirada e pagamento antecipado.</DialogDescription>
        </DialogHeader>
        <ol className="grid grid-cols-3 gap-2">
          {steps.map((label, index) => (
            <li key={label} className={cn("flex items-center gap-2 rounded-lg border px-2 py-2 text-xs", step === index + 1 ? "border-primary text-primary" : "border-border text-muted-foreground")}>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border border-current", step > index + 1 && "border-primary bg-primary text-primary-foreground")}>{step > index + 1 ? <Check className="h-3 w-3" /> : index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <section key={step} className="space-y-3 animate-in fade-in-0 slide-in-from-right-4 duration-300">
          <p className="text-sm font-semibold">{step === 1 ? "1. Escolha a bebida" : step === 2 ? "2. Escolha o energético" : "3. Escolha o gelo"}</p>
          <div className="grid grid-cols-2 gap-2">
            {step === 1 && opts.bebidas.map((item) => (
              <Chip key={item.label} active={selection.bebida === item.label} onClick={() => setSelection({ ...selection, bebida: item.label })}>
                <span className="block">{item.label}</span><span className="block text-sm font-bold text-primary">{brl(item.price)}</span>
              </Chip>
            ))}
            {step === 2 && opts.energeticos.map((item) => <Chip key={item} active={selection.energetico === item} onClick={() => setSelection({ ...selection, energetico: item })}>{item}</Chip>)}
            {step === 3 && opts.gelos.map((item) => <Chip key={item} active={selection.gelo === item} onClick={() => setSelection({ ...selection, gelo: item })}>{item}</Chip>)}
          </div>
        </section>
        <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-border bg-card p-4">
          <div><p className="text-xs text-muted-foreground">Valor da Dose</p><p className="font-display text-2xl text-primary">{chosenPrice ? brl(chosenPrice) : "A partir de R$ 35,00"}</p></div>
          <div className="flex gap-2">
            {step > 1 && <Button variant="outline" onClick={() => setStep((value) => value - 1)}>Voltar</Button>}
            <Button size="lg" disabled={!ready} onClick={() => {
              if (step < 3) return setStep((value) => value + 1);
              if (!selection.bebida || !selection.energetico || !selection.gelo) return;
              onConfirm({ bebida: selection.bebida, energetico: selection.energetico, gelo: selection.gelo });
              onOpenChange(false);
            }}>{step < 3 ? "Próximo passo" : confirmLabel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}