export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const promotionDiscount = (oldPrice: number, newPrice: number) => ({
  percent: Math.round((1 - newPrice / oldPrice) * 100),
  amount: Math.max(0, oldPrice - newPrice),
});

export const dateBR = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export const timeBR = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const daysSince = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

export const statusLabel: Record<string, string> = {
  RECEBIDO: "Pedido recebido",
  EM_PREPARACAO: "Em preparação",
  PRONTO: "Pronto",
  SAIU_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const paymentLabel: Record<string, string> = {
  PIX: "Pix",
  CARTAO: "Cartão",
  DINHEIRO: "Dinheiro",
  FIADO: "Pendente (fiado)",
};
