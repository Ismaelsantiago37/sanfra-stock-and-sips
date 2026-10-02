import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, Clock, Crown, MapPin, Store, Ticket, User, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brl } from "@/lib/format";
import { coupons } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { Coupon, LoyaltyLevel, PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Fechar pedido — Adega do Sanfra" },
      {
        name: "description",
        content: "Finalize em etapas: quem recebe, endereço, cupom, clube de vantagens e pagamento.",
      },
      { property: "og:title", content: "Fechar pedido — Adega do Sanfra" },
      { property: "og:description", content: "Entrega ou retirada, com pagamento na hora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

const payments: { id: PaymentMethod; label: string }[] = [
  { id: "PIX", label: "Pix" },
  { id: "CARTAO", label: "Cartão na entrega" },
  { id: "DINHEIRO", label: "Dinheiro" },
];

const steps = ["Quem recebe", "Entrega", "Cupom e vantagens", "Pagamento", "Revisão"];

const levelDiscount: Record<LoyaltyLevel, number> = { CLIENTE: 0, VIP: 5, BLACK: 10 };
const levelName: Record<LoyaltyLevel, string> = { CLIENTE: "Cliente", VIP: "VIP", BLACK: "Black" };
const levelRank: Record<LoyaltyLevel, number> = { CLIENTE: 0, VIP: 1, BLACK: 2 };

/** Estimativa fictícia (sem serviço de mapas): distância derivada do endereço, a partir da Vila Sanfra */
function estimate(address: string) {
  let h = 0;
  for (const c of address.trim().toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const km = Math.round((0.8 + (h % 72) / 10) * 10) / 10; // 0,8 a 8,0 km
  const fee = Math.round((4 + km * 1.2) * 100) / 100;
  const min = Math.round(15 + km * 4);
  return { km, fee, min, max: min + 10 };
}

const recipientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome de quem recebe").max(80),
  phone: z.string().trim().regex(/^[\d\s()+-]{10,16}$/, "Telefone inválido"),
});
const addressSchema = z.object({
  street: z.string().trim().min(3, "Informe a rua").max(100),
  number: z.string().trim().min(1, "Informe o número").max(10),
  district: z.string().trim().min(2, "Informe o bairro").max(60),
  complement: z.string().trim().max(60),
});

function Checkout() {
  const { cart, cartSubtotal, placeOrder, customer, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // etapa 1
  const [who, setWho] = useState<"EU" | "TERCEIRO">("EU");
  const [thirdName, setThirdName] = useState("");
  const [thirdPhone, setThirdPhone] = useState("");
  // etapa 2
  const [type, setType] = useState<"ENTREGA" | "RETIRADA">("ENTREGA");
  const [addr, setAddr] = useState(() => {
    const [street = "", rest = ""] = (customer?.address ?? "").split(",");
    const [number = "", district = ""] = rest.split("—").map((s) => s.trim());
    return { street: street.trim(), number, district, complement: "" };
  });
  // etapa 3
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  // etapa 4
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [change, setChange] = useState("");
  const [note, setNote] = useState("");

  const level = customer?.level ?? null;
  const fullAddress = `${addr.street}, ${addr.number} — ${addr.district}${addr.complement ? ` (${addr.complement})` : ""}`;
  const est = useMemo(() => estimate(`${addr.street} ${addr.number} ${addr.district}`), [addr]);
  const addressOk = addressSchema.safeParse(addr).success;

  const baseFee = type === "ENTREGA" ? est.fee : 0;
  const freeDelivery = level === "BLACK" || coupon?.code === "BLACKFRETE";
  const fee = freeDelivery ? 0 : baseFee;
  const clubOff = level ? Math.round(cartSubtotal * levelDiscount[level]) / 100 : 0;
  const couponOff = !coupon || coupon.code === "BLACKFRETE"
    ? 0
    : coupon.type === "VALUE"
      ? coupon.discount
      : Math.round(cartSubtotal * coupon.discount) / 100;
  const discount = Math.min(cartSubtotal, clubOff + couponOff);
  const total = Math.max(0, cartSubtotal - discount + fee);

  if (cart.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-muted-foreground">Nada no carrinho para finalizar.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/produtos" })}>
            Ver produtos
          </Button>
        </div>
      </SiteLayout>
    );
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    const c = coupons.find((x) => x.code === code);
    if (!code) return setError("Digite o código do cupom.");
    if (!c) return setError("Cupom não encontrado.");
    if (new Date(c.expiresAt) < new Date()) return setError("Este cupom expirou.");
    if (levelRank[level ?? "CLIENTE"] < levelRank[c.minLevel])
      return setError(`Cupom exclusivo para o nível ${levelName[c.minLevel]} do clube.`);
    if (c.code === "BAIRRO10" && cartSubtotal < 60)
      return setError("Válido para pedidos acima de R$ 60.");
    setError(null);
    setCoupon(c);
    toast.success(`Cupom ${c.code} aplicado!`);
  }

  function next() {
    setError(null);
    if (step === 0 && who === "TERCEIRO") {
      const r = recipientSchema.safeParse({ name: thirdName, phone: thirdPhone });
      if (!r.success) return setError(r.error.issues[0]!.message);
    }
    if (step === 1 && type === "ENTREGA") {
      const r = addressSchema.safeParse(addr);
      if (!r.success) return setError(r.error.issues[0]!.message);
    }
    setStep((s) => s + 1);
  }

  function confirm() {
    const recipientName = who === "TERCEIRO" ? thirdName.trim() : (user?.name ?? "Cliente");
    const extra = [note.trim(), paymentMethod === "DINHEIRO" && change ? `Troco para R$ ${change}` : ""]
      .filter(Boolean)
      .join(" · ");
    const order = placeOrder({
      type,
      ...(type === "ENTREGA" ? { address: fullAddress } : {}),
      paymentMethod,
      ...(extra ? { note: extra } : {}),
      discount,
      deliveryFee: fee,
      etaMinutes: type === "ENTREGA" ? est.max : 20,
      recipientName,
      ...(who === "TERCEIRO" ? { recipientPhone: thirdPhone.trim() } : {}),
    });
    toast.success(`Pedido #${order.number} enviado!`, {
      description: "Acompanhe o status em Meus Pedidos.",
    });
    navigate({ to: "/pedidos" });
  }

  const choice = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-left text-sm transition-colors",
      active ? "border-primary bg-primary/10 text-primary" : "hover:border-muted-foreground",
    );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl">Fechar pedido</h1>

        {/* progresso */}
        <ol className="mt-5 flex items-center gap-1">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
                  i < step && "border-primary bg-primary text-primary-foreground",
                  i === step && "border-primary text-primary",
                  i > step && "border-border text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("hidden text-[11px] sm:block", i === step ? "text-primary" : "text-muted-foreground")}>
                {s}
              </span>
            </li>
          ))}
        </ol>

        <section key={step} className="mt-6 animate-in fade-in slide-in-from-right-4 rounded-xl border border-border bg-card p-5 duration-300">
          {step === 0 && (
            <>
              <p className="font-medium">O pedido é para quem?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button className={choice(who === "EU")} onClick={() => setWho("EU")}>
                  <User className="h-5 w-5" />
                  <span>
                    Para mim
                    <span className="block text-xs text-muted-foreground">{user?.name ?? "Titular do perfil"}</span>
                  </span>
                </button>
                <button className={choice(who === "TERCEIRO")} onClick={() => setWho("TERCEIRO")}>
                  <Users className="h-5 w-5" />
                  <span>
                    Para outra pessoa
                    <span className="block text-xs text-muted-foreground">Alguém vai receber por você</span>
                  </span>
                </button>
              </div>
              {who === "TERCEIRO" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="tn">Nome de quem recebe</Label>
                    <Input id="tn" maxLength={80} value={thirdName} onChange={(e) => setThirdName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tp">Telefone</Label>
                    <Input id="tp" maxLength={16} placeholder="(11) 90000-0000" value={thirdPhone} onChange={(e) => setThirdPhone(e.target.value)} />
                  </div>
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    Quem receber precisa ser maior de 18 anos e apresentar documento na entrega.
                  </p>
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <p className="font-medium">Como você quer receber?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button className={choice(type === "ENTREGA")} onClick={() => setType("ENTREGA")}>
                  <MapPin className="h-5 w-5" /> Entrega no endereço
                </button>
                <button className={choice(type === "RETIRADA")} onClick={() => setType("RETIRADA")}>
                  <Store className="h-5 w-5" /> Retirar na adega (grátis)
                </button>
              </div>
              {type === "ENTREGA" ? (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_110px]">
                    <div className="space-y-1.5">
                      <Label htmlFor="rua">Rua</Label>
                      <Input id="rua" maxLength={100} value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="num">Número</Label>
                      <Input id="num" maxLength={10} value={addr.number} onChange={(e) => setAddr({ ...addr, number: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bai">Bairro</Label>
                      <Input id="bai" maxLength={60} value={addr.district} onChange={(e) => setAddr({ ...addr, district: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="comp">Compl.</Label>
                      <Input id="comp" maxLength={60} placeholder="Apto" value={addr.complement} onChange={(e) => setAddr({ ...addr, complement: e.target.value })} />
                    </div>
                  </div>
                  {addressOk && (
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Distância</p>
                        <p className="font-display text-xl text-primary">{est.km.toFixed(1).replace(".", ",")} km</p>
                      </div>
                      <div>
                        <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Tempo</p>
                        <p className="font-display text-xl text-primary">{est.min}–{est.max} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Taxa</p>
                        <p className="font-display text-xl text-primary">{freeDelivery ? "Grátis" : brl(est.fee)}</p>
                      </div>
                      <p className="col-span-3 text-[11px] text-muted-foreground">Estimativa média a partir da adega, na Vila Sanfra.</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 rounded-lg border border-border bg-surface-2 p-3 text-sm text-muted-foreground">
                  Retire no balcão da Adega do Sanfra, Vila Sanfra. Pronto em cerca de 20 min.
                </p>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className={cn("flex items-center gap-3 rounded-lg border p-4", level ? "border-primary/50 bg-primary/5" : "border-border")}>
                <Crown className={cn("h-6 w-6", level ? "text-primary" : "text-muted-foreground")} />
                {level ? (
                  <div className="text-sm">
                    <p className="font-medium">Você é do Clube de Vantagens — nível {levelName[level]}</p>
                    <p className="text-muted-foreground">
                      {levelDiscount[level] ? `${levelDiscount[level]}% de desconto aplicado automaticamente` : "Acumule pontos para chegar ao VIP"}
                      {level === "BLACK" ? " + frete grátis" : ""}. {customer!.points} pontos · este pedido rende +{Math.floor(total)}.
                    </p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="font-medium">Você ainda não faz parte do Clube de Vantagens</p>
                    <p className="text-muted-foreground">Entre na sua conta para ganhar pontos e descontos.</p>
                  </div>
                )}
              </div>

              <p className="mt-5 flex items-center gap-2 font-medium"><Ticket className="h-4 w-4" /> Tem cupom de desconto?</p>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Digite o código"
                  maxLength={20}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={!!coupon}
                />
                {coupon ? (
                  <Button variant="outline" onClick={() => { setCoupon(null); setCouponInput(""); }}>Remover</Button>
                ) : (
                  <Button onClick={applyCoupon}>Aplicar</Button>
                )}
              </div>
              {coupon && <p className="mt-2 text-sm text-primary">✓ {coupon.code}: {coupon.description}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <p className="font-medium">Forma de pagamento</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {payments.map((p) => (
                  <button key={p.id} className={cn(choice(paymentMethod === p.id), "justify-center")} onClick={() => setPaymentMethod(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
              {paymentMethod === "DINHEIRO" && (
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="troco">Troco para quanto? (opcional)</Label>
                  <Input id="troco" inputMode="decimal" maxLength={8} value={change} onChange={(e) => setChange(e.target.value.replace(/[^\d,]/g, ""))} />
                </div>
              )}
              <p className="mt-3 rounded-lg border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
                Fiado (valor pendente) só no balcão: pedidos feitos pelo site precisam ser pagos na hora.
              </p>
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="obs">Observação</Label>
                <Textarea id="obs" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: tudo bem gelado, interfone quebrado" />
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-3 text-sm">
              <Row label="Recebe" value={who === "TERCEIRO" ? `${thirdName} · ${thirdPhone}` : (user?.name ?? "Você")} />
              <Row label={type === "ENTREGA" ? "Entregar em" : "Retirada"} value={type === "ENTREGA" ? `${fullAddress} · ${est.km.toFixed(1).replace(".", ",")} km · ${est.min}–${est.max} min` : "Balcão da adega · ~20 min"} />
              <Row label="Pagamento" value={payments.find((p) => p.id === paymentMethod)!.label} />
              {note && <Row label="Observação" value={note} />}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </section>

        {/* resumo */}
        <section className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{brl(cartSubtotal)}</span></div>
          {clubOff > 0 && <div className="mt-1 flex justify-between text-primary"><span>Clube {levelName[level!]}</span><span>-{brl(clubOff)}</span></div>}
          {couponOff > 0 && <div className="mt-1 flex justify-between text-primary"><span>Cupom {coupon!.code}</span><span>-{brl(couponOff)}</span></div>}
          <div className="mt-1 flex justify-between">
            <span className="text-muted-foreground">Entrega</span>
            <span>{type === "RETIRADA" ? "Retirada" : freeDelivery ? "Grátis" : step >= 1 && addressOk ? brl(fee) : "a calcular"}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <span className="font-medium">Total</span>
            <span className="font-display text-2xl text-primary">{brl(total)}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="lg" onClick={() => { setError(null); setStep((s) => s - 1); }}>
                <ChevronLeft className="h-4 w-4" /> Voltar
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button size="lg" className="flex-1" onClick={next}>Continuar</Button>
            ) : (
              <Button size="lg" className="flex-1" onClick={confirm}>Confirmar pedido</Button>
            )}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
