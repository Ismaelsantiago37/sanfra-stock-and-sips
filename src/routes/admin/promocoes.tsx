import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CalendarRange, Flame, Plus, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { Chip } from "@/components/site/VariationPickers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brl, dateBR } from "@/lib/format";
import { isPromoLive, useApp } from "@/lib/store";
import type { Product, Promotion } from "@/lib/types";

export const Route = createFileRoute("/admin/promocoes")({
  head: () => ({
    meta: [
      { title: "Promoções e cronogramas — Adega do Sanfra" },
      { name: "description", content: "Crie promoções por produto, período e valor, e programe cronogramas para fins de semana e feriados." },
      { property: "og:title", content: "Promoções e cronogramas — Adega do Sanfra" },
      { property: "og:description", content: "Gestão e agendamento das ofertas da adega." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPromocoes,
});

const DAY = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const WEEK = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Feriados nacionais (para destacar dias quentes no cronograma) */
const HOLIDAYS: Record<string, string> = {
  "2026-10-12": "N. Sra. Aparecida",
  "2026-11-02": "Finados",
  "2026-11-15": "Proclamação da República",
  "2026-11-20": "Consciência Negra",
  "2026-12-24": "Véspera de Natal",
  "2026-12-25": "Natal",
  "2026-12-31": "Réveillon",
  "2027-01-01": "Ano Novo",
  "2027-02-08": "Carnaval",
  "2027-02-09": "Carnaval",
  "2027-03-26": "Sexta-feira Santa",
  "2027-04-21": "Tiradentes",
  "2027-05-01": "Dia do Trabalho",
};

type ScheduleKind = "fds" | "15d" | "mes";
const SCHEDULES: Record<ScheduleKind, { label: string; desc: string }> = {
  fds: { label: "Próximo fim de semana", desc: "Sexta a domingo" },
  "15d": { label: "Próximos 15 dias", desc: "Ofertas nas sextas, sábados, domingos e feriados" },
  mes: { label: "Próximo mês (30 dias)", desc: "Ofertas nas sextas, sábados, domingos e feriados" },
};

interface SimDay {
  date: Date;
  hot: boolean;
  reason?: string;
}

function simulateDays(kind: ScheduleKind): SimDay[] {
  const today = startOf(new Date());
  if (kind === "fds") {
    const toFri = (5 - today.getDay() + 7) % 7;
    const fri = new Date(today.getTime() + toFri * DAY);
    return [0, 1, 2].map((i) => {
      const d = new Date(fri.getTime() + i * DAY);
      return { date: d, hot: true, reason: HOLIDAYS[isoDay(d)] ?? "Fim de semana" };
    });
  }
  const n = kind === "15d" ? 15 : 30;
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getTime() + i * DAY);
    const h = HOLIDAYS[isoDay(d)];
    const wk = [0, 5, 6].includes(d.getDay());
    return { date: d, hot: !!h || wk, ...(h ? { reason: h } : wk ? { reason: "Fim de semana" } : {}) };
  });
}

/** junta dias quentes consecutivos em blocos (ex.: sex→dom vira uma única promoção) */
function hotBlocks(days: SimDay[]) {
  const blocks: { start: Date; end: Date; reasons: string[] }[] = [];
  days.forEach((d) => {
    if (!d.hot) return;
    const last = blocks[blocks.length - 1];
    if (last && d.date.getTime() - last.end.getTime() <= DAY) {
      last.end = d.date;
      if (d.reason && !last.reasons.includes(d.reason)) last.reasons.push(d.reason);
    } else blocks.push({ start: d.date, end: d.date, reasons: d.reason ? [d.reason] : [] });
  });
  return blocks;
}

function ProductPicker({
  products,
  selected,
  onToggle,
}: {
  products: Product[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const list = products.filter((p) => p.active && p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-2">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto" className="max-w-sm" />
      <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Chip key={p.id} active={selected.includes(p.id)} onClick={() => onToggle(p.id)}>
            <span className="block">{p.name}</span>
            <span className="block text-[11px] opacity-80">{brl(p.price)}</span>
          </Chip>
        ))}
      </div>
    </div>
  );
}

function AdminPromocoes() {
  const { promotions, products, savePromotion, savePromotions, removePromotion } = useApp();
  const vigentes = promotions.filter((p) => isPromoLive(p)).length;
  const agendadas = promotions.filter((p) => p.active && p.startsAt && new Date(p.startsAt) > new Date()).length;
  const descontoMedio =
    promotions.reduce((s, p) => s + (1 - p.newPrice / p.oldPrice) * 100, 0) / Math.max(promotions.length, 1);

  const sorted = [...promotions].sort(
    (a, b) => +new Date(a.startsAt ?? 0) - +new Date(b.startsAt ?? 0),
  );

  return (
    <AdminLayout title="Promoções" description="Crie ofertas e programe cronogramas — tudo aparece para os clientes no período definido">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="No ar agora" value={String(vigentes)} icon={Tag} tone="positive" />
        <Kpi label="Agendadas" value={String(agendadas)} icon={CalendarDays} />
        <Kpi label="Cadastradas" value={String(promotions.length)} />
        <Kpi label="Desconto médio" value={`${descontoMedio.toFixed(0)}%`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <NewPromotion products={products} onSave={savePromotion} />
        <ScheduleWizard products={products} onConfirm={savePromotions} />
      </div>

      <Panel title="Todas as promoções" className="mt-4">
        <div className="grid gap-3 lg:grid-cols-2">
          {sorted.map((p) => (
            <PromoCard
              key={p.id}
              promo={p}
              product={products.find((x) => x.id === p.productId)}
              onSave={savePromotion}
              onRemove={() => removePromotion(p.id)}
            />
          ))}
        </div>
      </Panel>
    </AdminLayout>
  );
}

function status(p: Promotion) {
  if (!p.active) return { label: "Pausada", variant: "outline" as const };
  if (p.startsAt && new Date(p.startsAt) > new Date()) return { label: "Agendada", variant: "outline" as const };
  if (new Date(p.expiresAt) < new Date()) return { label: "Encerrada", variant: "outline" as const };
  return { label: "No ar", variant: "secondary" as const };
}

function PromoCard({
  promo: p,
  product,
  onSave,
  onRemove,
}: {
  promo: Promotion;
  product: Product | undefined;
  onSave: (p: Promotion) => void;
  onRemove: () => void;
}) {
  const [price, setPrice] = useState(String(p.newPrice));
  const [start, setStart] = useState((p.startsAt ?? new Date().toISOString()).slice(0, 10));
  const [end, setEnd] = useState(p.expiresAt.slice(0, 10));
  const st = status(p);
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm font-semibold">{p.title}</p>
        <Badge variant={st.variant}>{st.label}</Badge>
        {p.featured && <Badge variant="outline">Destaque</Badge>}
        {p.scheduleId && <Badge variant="outline">Cronograma</Badge>}
      </div>
      <p className="text-xs text-muted-foreground">
        {product?.name ?? "Produto removido"} · {dateBR(p.startsAt ?? new Date().toISOString())} até {dateBR(p.expiresAt)}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <label className="text-[11px] text-muted-foreground">
          Preço promo ({brl(p.oldPrice)})
          <Input type="number" step="0.1" value={price} onChange={(e) => setPrice(e.target.value)} className="h-8" />
        </label>
        <label className="text-[11px] text-muted-foreground">
          Início
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="h-8" />
        </label>
        <label className="text-[11px] text-muted-foreground">
          Fim
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="h-8" />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            const v = Number(price);
            if (!(v > 0) || v >= p.oldPrice) return toast.error("O preço promocional deve ser menor que o original.");
            if (end < start) return toast.error("A data final deve ser depois do início.");
            onSave({ ...p, newPrice: v, startsAt: `${start}T00:00:00`, expiresAt: `${end}T23:59:59` });
            toast.success("Promoção atualizada");
            return undefined;
          }}
        >
          Salvar
        </Button>
        <Button size="sm" variant="outline" onClick={() => onSave({ ...p, active: !p.active })}>
          {p.active ? "Pausar" : "Ativar"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onSave({ ...p, featured: !p.featured })}>
          {p.featured ? "Tirar destaque" : "Destacar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          Excluir
        </Button>
      </div>
    </div>
  );
}

function NewPromotion({ products, onSave }: { products: Product[]; onSave: (p: Promotion) => void }) {
  const today = isoDay(new Date());
  const [sel, setSel] = useState<string[]>([]);
  const [mode, setMode] = useState<"pct" | "price">("pct");
  const [value, setValue] = useState("10");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(isoDay(new Date(Date.now() + 7 * DAY)));
  const [featured, setFeatured] = useState(false);

  const create = () => {
    const v = Number(value);
    if (!sel.length) return toast.error("Selecione ao menos um produto.");
    if (end < start) return toast.error("A data final deve ser depois do início.");
    if (!(v > 0) || (mode === "pct" && v >= 90)) return toast.error("Informe um desconto válido.");
    let n = 0;
    sel.forEach((id) => {
      const p = products.find((x) => x.id === id)!;
      const newPrice = mode === "pct" ? Math.round(p.price * (1 - v / 100) * 100) / 100 : v;
      if (newPrice >= p.price) return;
      n++;
      onSave({
        id: `pr${Date.now()}${id}`,
        title: `${p.name} em oferta`,
        productId: id,
        oldPrice: p.price,
        newPrice,
        startsAt: `${start}T00:00:00`,
        expiresAt: `${end}T23:59:59`,
        availableQty: null,
        featured,
        active: true,
      });
    });
    if (!n) return toast.error("O preço promocional precisa ser menor que o preço atual.");
    toast.success(`${n} promoção(ões) criada(s)`);
    setSel([]);
    return undefined;
  };

  return (
    <Panel title="Nova promoção" description="Escolha os produtos, o período e o valor">
      <div className="space-y-3">
        <ProductPicker
          products={products}
          selected={sel}
          onToggle={(id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
        />
        <div className="flex flex-wrap gap-2">
          <Chip active={mode === "pct"} onClick={() => setMode("pct")}>Desconto em %</Chip>
          <Chip active={mode === "price"} onClick={() => setMode("price")}>Preço fixo (R$)</Chip>
          <Chip active={featured} onClick={() => setFeatured((f) => !f)}>Destacar na loja</Chip>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs text-muted-foreground">
            {mode === "pct" ? "Desconto (%)" : "Preço promo (R$)"}
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          </label>
          <label className="text-xs text-muted-foreground">
            Início
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="text-xs text-muted-foreground">
            Fim
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        <Button onClick={create}>
          <Plus className="h-4 w-4" /> Criar promoção {sel.length > 1 ? `(${sel.length} produtos)` : ""}
        </Button>
      </div>
    </Panel>
  );
}

function ScheduleWizard({ products, onConfirm }: { products: Product[]; onConfirm: (p: Promotion[]) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [kind, setKind] = useState<ScheduleKind>("fds");
  const [sel, setSel] = useState<string[]>([]);
  const [pct, setPct] = useState("15");

  const days = useMemo(() => simulateDays(kind), [kind]);
  const blocks = useMemo(() => hotBlocks(days), [days]);
  const pctN = Number(pct) || 0;
  const chosen = products.filter((p) => sel.includes(p.id));
  // estimativa simples: dia quente vende ~1,8x; o desconto aumenta o volume
  const estimate = blocks.reduce((s, b) => s + ((b.end.getTime() - b.start.getTime()) / DAY + 1), 0);

  const confirm = () => {
    const sid = `sch${Date.now()}`;
    const list: Promotion[] = [];
    blocks.forEach((b, bi) =>
      chosen.forEach((p) =>
        list.push({
          id: `${sid}-${bi}-${p.id}`,
          title: `${p.name} — ${b.reasons[0] ?? "Oferta"}`,
          productId: p.id,
          oldPrice: p.price,
          newPrice: Math.round(p.price * (1 - pctN / 100) * 100) / 100,
          startsAt: `${isoDay(b.start)}T00:00:00`,
          expiresAt: `${isoDay(b.end)}T23:59:59`,
          scheduleId: sid,
          availableQty: null,
          featured: b.reasons.some((r) => r !== "Fim de semana"),
          active: true,
        }),
      ),
    );
    onConfirm(list);
    toast.success(`Cronograma confirmado: ${list.length} promoções agendadas`, {
      description: "Ajuste preços e datas individualmente na lista abaixo.",
    });
    setStep(1);
    setSel([]);
  };

  return (
    <Panel title="Cronograma de promoções" description="Programe ofertas para fins de semana e feriados">
      <div className="mb-3 flex gap-1 text-xs">
        {["Período", "Produtos e desconto", "Simulação"].map((l, i) => (
          <span
            key={l}
            className={`flex-1 rounded-full px-2 py-1 text-center ${step === i + 1 ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}
          >
            {i + 1}. {l}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Adicionar cronograma para os próximos…</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(SCHEDULES) as ScheduleKind[]).map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                <span className="block font-semibold">{SCHEDULES[k].label}</span>
                <span className="block text-[11px] opacity-80">{SCHEDULES[k].desc}</span>
              </Chip>
            ))}
          </div>
          <Button onClick={() => setStep(2)}>Próximo passo</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <ProductPicker
            products={products}
            selected={sel}
            onToggle={(id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
          />
          <label className="block max-w-40 text-xs text-muted-foreground">
            Desconto nos dias quentes (%)
            <Input type="number" value={pct} onChange={(e) => setPct(e.target.value)} />
          </label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
            <Button disabled={!sel.length || pctN <= 0 || pctN >= 90} onClick={() => setStep(3)}>
              Simular período
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-sm">
            <CalendarRange className="mr-1 inline h-4 w-4 text-primary" />
            {SCHEDULES[kind].label}: {dateBR(days[0]!.date.toISOString())} a {dateBR(days[days.length - 1]!.date.toISOString())}
          </p>
          <div className="grid grid-cols-5 gap-1 sm:grid-cols-8">
            {days.map((d) => (
              <div
                key={d.date.toISOString()}
                title={d.reason}
                className={`rounded-md border p-1 text-center text-[11px] ${d.hot ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
              >
                <div>{WEEK[d.date.getDay()]}</div>
                <div className="font-display text-base">{d.date.getDate()}</div>
                {d.reason && d.reason !== "Fim de semana" && <Flame className="mx-auto h-3 w-3" />}
              </div>
            ))}
          </div>
          <ul className="space-y-1 text-xs">
            {blocks.map((b) => (
              <li key={b.start.toISOString()} className="rounded-lg bg-surface-2 p-2">
                <strong className="text-primary">
                  {dateBR(b.start.toISOString())}
                  {b.end > b.start ? ` → ${dateBR(b.end.toISOString())}` : ""}
                </strong>{" "}
                · {b.reasons.join(", ")}
                <div className="mt-1 text-muted-foreground">
                  {chosen.map((p) => `${p.name}: ${brl(p.price)} → ${brl(p.price * (1 - pctN / 100))}`).join(" · ")}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Serão criadas <strong className="text-primary">{blocks.length * chosen.length}</strong> promoções em{" "}
            {estimate} dias de maior movimento. Elas aparecem para os clientes só nas datas acima.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
            <Button disabled={!blocks.length} onClick={confirm}>Confirmar cronograma</Button>
          </div>
        </div>
      )}
    </Panel>
  );
}
