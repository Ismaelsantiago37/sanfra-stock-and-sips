/**
 * Camada analítica do painel do dono.
 * Números mockados, mas com formato pronto para virar consultas agregadas
 * (vendas por período, despesas por categoria, lucro e volume de clientela).
 */

export interface MonthPoint {
  month: string;
  revenue: number;
  expenses: number;
  orders: number;
}

export const monthlyFinance: MonthPoint[] = [
  { month: "Mar", revenue: 38200, expenses: 26400, orders: 612 },
  { month: "Abr", revenue: 41850, expenses: 27950, orders: 668 },
  { month: "Mai", revenue: 39400, expenses: 27100, orders: 634 },
  { month: "Jun", revenue: 46700, expenses: 29800, orders: 742 },
  { month: "Jul", revenue: 52300, expenses: 32100, orders: 826 },
  { month: "Ago", revenue: 57950, expenses: 34250, orders: 901 },
];

export interface ExpenseLine {
  id: string;
  category: string;
  description: string;
  amount: number;
  recurring: boolean;
}

export const expenses: ExpenseLine[] = [
  {
    id: "e1",
    category: "Fornecedores",
    description: "Compra de estoque (cervejas, whisky e importados)",
    amount: 19850,
    recurring: true,
  },
  {
    id: "e2",
    category: "Folha",
    description: "Salários + entregador fixo",
    amount: 6800,
    recurring: true,
  },
  { id: "e3", category: "Aluguel", description: "Ponto comercial", amount: 3200, recurring: true },
  {
    id: "e4",
    category: "Energia",
    description: "Câmaras frias e freezers",
    amount: 2150,
    recurring: true,
  },
  {
    id: "e5",
    category: "Logística",
    description: "Combustível e manutenção da moto",
    amount: 1250,
    recurring: true,
  },
  {
    id: "e6",
    category: "Impostos e taxas",
    description: "Simples Nacional + maquininha",
    amount: 900,
    recurring: true,
  },
  {
    id: "e7",
    category: "Marketing",
    description: "Impulsionamento local e panfletos",
    amount: 100,
    recurring: false,
  },
];

export const salesByCategory = [
  { name: "Cervejas", value: 21400 },
  { name: "Whisky", value: 14200 },
  { name: "Importados", value: 8600 },
  { name: "Destilados", value: 6100 },
  { name: "Licores", value: 3450 },
  { name: "Outros", value: 4200 },
];

export const salesByChannel = [
  { name: "Entrega", value: 68 },
  { name: "Retirada", value: 32 },
];

export const weekdayTraffic = [
  { day: "Seg", customers: 42, revenue: 3100 },
  { day: "Ter", customers: 38, revenue: 2750 },
  { day: "Qua", customers: 51, revenue: 3620 },
  { day: "Qui", customers: 74, revenue: 5480 },
  { day: "Sex", customers: 148, revenue: 12400 },
  { day: "Sáb", customers: 176, revenue: 15900 },
  { day: "Dom", customers: 97, revenue: 7300 },
];

export const hourlyTraffic = [
  { hour: "12h", customers: 9 },
  { hour: "14h", customers: 14 },
  { hour: "16h", customers: 22 },
  { hour: "17h", customers: 34 },
  { hour: "18h", customers: 58 },
  { hour: "19h", customers: 96 },
  { hour: "20h", customers: 132 },
  { hour: "21h", customers: 147 },
  { hour: "22h", customers: 121 },
  { hour: "23h", customers: 88 },
  { hour: "00h", customers: 54 },
  { hour: "01h", customers: 27 },
];

/** Mapa de calor: linhas = dias, colunas = faixas de horário. */
export const heatHours = ["16-18h", "18-20h", "20-22h", "22-00h", "00-02h"];
export const heatmap: { day: string; values: number[] }[] = [
  { day: "Seg", values: [8, 16, 21, 11, 4] },
  { day: "Ter", values: [7, 14, 18, 9, 3] },
  { day: "Qua", values: [10, 19, 26, 14, 5] },
  { day: "Qui", values: [14, 27, 39, 21, 8] },
  { day: "Sex", values: [22, 48, 74, 62, 31] },
  { day: "Sáb", values: [26, 55, 88, 71, 38] },
  { day: "Dom", values: [18, 34, 45, 25, 9] },
];

export const currentMonth = monthlyFinance[monthlyFinance.length - 1]!;
export const previousMonth = monthlyFinance[monthlyFinance.length - 2]!;

export const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
export const grossProfit = currentMonth.revenue - currentMonth.expenses;
export const margin = (grossProfit / currentMonth.revenue) * 100;
export const growth =
  ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
export const avgTicket = currentMonth.revenue / currentMonth.orders;

export const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];
