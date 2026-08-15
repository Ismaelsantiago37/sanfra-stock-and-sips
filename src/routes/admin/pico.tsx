import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Flame, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Kpi, Panel } from "@/components/admin/Kpi";
import { heatHours, heatmap, hourlyTraffic, weekdayTraffic } from "@/lib/analytics";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/pico")({
  head: () => ({
    meta: [
      { title: "Horários de pico — Adega do Sanfra" },
      {
        name: "description",
        content: "Volume de clientela por dia da semana e faixa de horário para escalar equipe e estoque.",
      },
      { property: "og:title", content: "Horários de pico — Adega do Sanfra" },
      { property: "og:description", content: "Quando a adega enche de verdade." },
    ],
  }),
  component: Pico,
});

function Pico() {
  const melhorDia = [...weekdayTraffic].sort((a, b) => b.customers - a.customers)[0]!;
  const melhorHora = [...hourlyTraffic].sort((a, b) => b.customers - a.customers)[0]!;
  const semana = weekdayTraffic.reduce((s, d) => s + d.customers, 0);
  const fimDeSemana = weekdayTraffic
    .filter((d) => ["Sex", "Sáb", "Dom"].includes(d.day))
    .reduce((s, d) => s + d.customers, 0);
  const max = Math.max(...heatmap.flatMap((r) => r.values));

  return (
    <AdminLayout title="Horários de Pico" description="Volume de clientela por dia e horário">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Dia mais cheio"
          value={melhorDia.day}
          hint={`${melhorDia.customers} clientes • ${brl(melhorDia.revenue)}`}
          icon={CalendarDays}
        />
        <Kpi label="Horário de pico" value={melhorHora.hour} hint={`${melhorHora.customers} clientes`} icon={Clock} />
        <Kpi label="Clientes por semana" value={String(semana)} icon={Users} />
        <Kpi
          label="Concentração sex–dom"
          value={`${Math.round((fimDeSemana / semana) * 100)}%`}
          hint="do movimento total"
          icon={Flame}
          tone="positive"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Clientela por dia da semana">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Bar dataKey="customers" name="Clientes" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Clientela por horário" description="Média diária ao longo do expediente">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Area
                  type="monotone"
                  dataKey="customers"
                  name="Clientes"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Mapa de calor: dia x faixa de horário"
        description="Quanto mais amarelo, mais gente na adega"
        className="mt-4"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-center text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="p-2 text-left">Dia</th>
                {heatHours.map((h) => (
                  <th key={h} className="p-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.map((row) => (
                <tr key={row.day}>
                  <td className="p-2 text-left font-medium">{row.day}</td>
                  {row.values.map((v, i) => (
                    <td key={heatHours[i]} className="p-1">
                      <div
                        className="rounded-md py-2 font-medium"
                        style={{
                          backgroundColor: `color-mix(in oklab, var(--primary) ${Math.round((v / max) * 100)}%, var(--surface-2))`,
                          color: v / max > 0.45 ? "var(--primary-foreground)" : "var(--foreground)",
                        }}
                      >
                        {v}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Recomendação: reforçar entregador e estoque de gelo entre 20h e 00h de sexta a domingo.
        </p>
      </Panel>
    </AdminLayout>
  );
}
