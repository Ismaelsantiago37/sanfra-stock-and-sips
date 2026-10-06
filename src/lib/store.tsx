import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Context, ReactNode } from "react";

import * as mock from "./mock-data";
import type {
  AppNotification,
  CartItem,
  ComboSelection,
  ProductOptions,
  Customer,
  LoyaltyLevel,
  Order,
  OrderStatus,
  PaymentMethod,
  PendingPayment,
  Product,
  Promotion,
  User,
} from "./types";

/**
 * Camada de dados da aplicação.
 * Hoje usa dados mockados em memória (persistidos no localStorage);
 * a interface abaixo foi desenhada para ser trocada por chamadas ao backend
 * sem alterar os componentes.
 */

interface AppState {
  loading: boolean;
  user: User | null;
  customer: Customer | null;
  products: Product[];
  promotions: Promotion[];
  orders: Order[];
  customers: Customer[];
  pendings: PendingPayment[];
  notifications: AppNotification[];
  cart: CartItem[];
  // auth
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  // cart
  addToCart: (
    productId: string,
    quantity?: number,
    extra?: {
      size?: string | undefined;
      flavors?: string[] | undefined;
      combo?: ComboSelection | undefined;
    },
  ) => void;
  /** substitui (ou remove, com null) uma linha do carrinho */
  updateCartLine: (index: number, item: CartItem | null) => void;
  unitPriceOf: (item: CartItem) => number;
  clearCart: () => void;
  /** Quantas unidades ainda podem ir para o carrinho (estoque − o que já está no carrinho) */
  stockLeft: (productId: string, variant?: string, excludeIndex?: number) => number;
  /** Estoque cadastrado de uma variação (ou do produto, sem variação) */
  stockOf: (productId: string, variant?: string) => number;
  cartCount: number;
  cartSubtotal: number;
  // orders
  placeOrder: (input: {
    type: "ENTREGA" | "RETIRADA";
    address?: string;
    paymentMethod: PaymentMethod;
    note?: string;
    discount?: number;
    deliveryFee?: number;
    etaMinutes?: number;
    recipientName?: string;
    recipientPhone?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  // promotions
  savePromotion: (promo: Promotion) => void;
  /** grava várias promoções de uma vez (cronogramas) */
  savePromotions: (promos: Promotion[]) => void;
  removePromotion: (id: string) => void;
  // products
  saveProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  // pendings
  setPendingStatus: (id: string, status: PendingPayment["status"]) => void;
  // notifications
  markAllRead: (audience: "CUSTOMER" | "ADMIN") => void;
  pushNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
}

// Mantém o mesmo contexto entre recargas rápidas em desenvolvimento
const g = globalThis as unknown as { __adegaCtx?: Context<AppState | null> };
const AppContext = g.__adegaCtx ?? (g.__adegaCtx = createContext<AppState | null>(null));

const STORAGE_KEY = "adega-state-v1";

interface Persisted {
  userId: string | null;
  cart: CartItem[];
  orders: Order[];
  /** produtos (estoque editado pelo admin) */
  products?: Product[];
  promotions?: Promotion[];
}

// ⚠️ PROMOÇÃO VIGENTE: só vale para o cliente se estiver ativa e dentro do período
// (início/fim) definido pelo admin — é isso que agenda os cronogramas automaticamente.
export function isPromoLive(p: Promotion, now = new Date()) {
  if (!p.active) return false;
  if (p.startsAt && new Date(p.startsAt) > now) return false;
  return new Date(p.expiresAt) >= now;
}

/** Lista de variações que têm estoque próprio (sabores ou marcas/tamanhos) */
export function variantLabels(p: Product): string[] {
  if (p.options?.kind === "size") return p.options.sizes.map((s) => s.label);
  if (p.options?.kind === "flavor") return p.options.flavors;
  return [];
}

/** Semeia estoque por variação nos dados mockados (alguns sabores começam em falta para demonstração) */
function seedVariantStock(list: Product[]): Product[] {
  return list.map((p) => {
    const labels = variantLabels(p);
    if (!labels.length || p.variantStock) return p;
    const variantStock: Record<string, number> = {};
    labels.forEach((l, i) => {
      let h = 0;
      for (const ch of p.id + l) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      variantStock[l] = h % 9 === 0 && i > 0 ? 0 : 4 + (h % 22);
    });
    return { ...p, variantStock, stock: Object.values(variantStock).reduce((a, b) => a + b, 0) };
  });
}

/** Mantém `stock` sincronizado com a soma do estoque por variação */
function normalizeStock(p: Product): Product {
  if (!p.variantStock) return p;
  return { ...p, stock: Object.values(p.variantStock).reduce((a, b) => a + Math.max(0, b), 0) };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(() => seedVariantStock(mock.products));
  const [promotions, setPromotions] = useState<Promotion[]>(mock.promotions);
  const [orders, setOrders] = useState<Order[]>(mock.orders);
  const [customers] = useState<Customer[]>(mock.customers);
  const [pendings, setPendings] = useState<PendingPayment[]>(mock.pendingPayments);
  const [notifications, setNotifications] = useState<AppNotification[]>(mock.notifications);

  // hidratação client-side (simula o fetch inicial do backend)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Persisted;
        setCart(data.cart ?? []);
        if (data.orders?.length) setOrders(data.orders);
        if (data.promotions) setPromotions(data.promotions);
        // estoque salvo pelo admin (mantém produtos novos do catálogo que ainda não estavam salvos)
        if (data.products?.length) {
          const saved = new Map(data.products.map((p) => [p.id, p]));
          setProducts((prev) =>
            prev.map((p) => {
              const sp = saved.get(p.id);
              return sp ? normalizeStock({ ...p, stock: sp.stock, variantStock: sp.variantStock ?? p.variantStock, active: sp.active, price: sp.price }) : p;
            }),
          );
        }
        const u = mock.users.find((x) => x.id === data.userId);
        setUser(u ?? null);
      }
    } catch {
      /* ignora estado corrompido */
    }
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const payload: Persisted = { userId: user?.id ?? null, cart, orders, products, promotions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [user, cart, orders, products, promotions, loading]);

  const stockOf = useCallback(
    (productId: string, variant?: string) => {
      const p = products.find((x) => x.id === productId);
      if (!p) return 0;
      if (variant && p.variantStock) return Math.max(0, p.variantStock[variant] ?? 0);
      return Math.max(0, p.stock);
    },
    [products],
  );

  // ⚠️ LIMITE DE ESTOQUE: desconta do estoque o que o cliente já colocou no carrinho,
  // assim nunca é possível adicionar mais unidades do que as disponíveis.
  const stockLeft = useCallback(
    (productId: string, variant?: string, excludeIndex?: number) => {
      const p = products.find((x) => x.id === productId);
      if (!p) return 0;
      const perVariant = !!(variant && p.variantStock);
      let used = 0;
      cart.forEach((i, n) => {
        if (n === excludeIndex || i.productId !== productId) return;
        if (!perVariant) used += i.quantity;
        else if (i.size !== undefined) used += i.size === variant ? i.quantity : 0;
        else used += (i.flavors ?? []).filter((f) => f === variant).length;
      });
      return Math.max(0, stockOf(productId, variant) - used);
    },
    [products, cart, stockOf],
  );

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const found = mock.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || password.length < 4) throw new Error("E-mail ou senha inválidos.");
    setUser(found);
    return found;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const addToCart = useCallback(
    (
      productId: string,
      quantity = 1,
      extra?: {
        size?: string | undefined;
        flavors?: string[] | undefined;
        combo?: ComboSelection | undefined;
      },
    ) => {
      setCart((prev) => {
        if (extra?.combo) return [...prev, { productId, quantity, combo: extra.combo }];
        const size = extra?.size;
        const flavors = extra?.flavors;
        const idx = prev.findIndex(
          (i) => i.productId === productId && (i.size ?? "") === (size ?? ""),
        );
        if (idx >= 0) {
          return prev.map((i, n) =>
            n === idx
              ? {
                  ...i,
                  quantity: i.quantity + quantity,
                  ...(flavors ? { flavors: [...(i.flavors ?? []), ...flavors] } : {}),
                }
              : i,
          );
        }
        return [...prev, { productId, quantity, size, flavors }];
      });
    },
    [],
  );

  const updateCartLine = useCallback((index: number, item: CartItem | null) => {
    setCart((prev) =>
      item === null || item.quantity <= 0
        ? prev.filter((_, n) => n !== index)
        : prev.map((i, n) => (n === index ? item : i)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const priceOf = useCallback(
    (productId: string) => {
      const promo = promotions.find((p) => isPromoLive(p) && p.productId === productId);
      if (promo) return promo.newPrice;
      return products.find((p) => p.id === productId)?.price ?? 0;
    },
    [products, promotions],
  );

  const unitPriceOf = useCallback(
    (item: CartItem) => {
      const p = products.find((x) => x.id === item.productId);
      if (item.combo && p?.options?.kind === "combo") return comboPrice(p.options, item.combo);
      if (item.size && p?.options?.kind === "size") {
        const opt = p.options.sizes.find((o) => o.label === item.size);
        if (opt) return opt.price;
      }
      return priceOf(item.productId);
    },
    [products, priceOf],
  );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + unitPriceOf(i) * i.quantity, 0);

  const pushNotification = useCallback((n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [
      { ...n, id: `n${Date.now()}`, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const placeOrder: AppState["placeOrder"] = useCallback(
    ({ type, address, paymentMethod, note, discount = 0, deliveryFee: fee, etaMinutes, recipientName, recipientPhone }) => {
      const items = cart.map((i) => {
        const p = products.find((x) => x.id === i.productId)!;
        return {
          productId: p.id,
          name: describeVariation(p.name, i),
          unitPrice: unitPriceOf(i),
          quantity: i.quantity,
        };
      });
      // baixa no estoque (geral e por variação) após o pedido
      setProducts((prev) =>
        prev.map((p) => {
          const lines = cart.filter((i) => i.productId === p.id);
          if (!lines.length) return p;
          if (p.variantStock) {
            const vs = { ...p.variantStock };
            lines.forEach((i) => {
              if (i.size) vs[i.size] = Math.max(0, (vs[i.size] ?? 0) - i.quantity);
              (i.flavors ?? []).forEach((f) => (vs[f] = Math.max(0, (vs[f] ?? 0) - 1)));
            });
            return normalizeStock({ ...p, variantStock: vs });
          }
          const q = lines.reduce((a, i) => a + i.quantity, 0);
          return { ...p, stock: Math.max(0, p.stock - q) };
        }),
      );
      const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const deliveryFee = type === "ENTREGA" ? (fee ?? 6) : 0;
      const nextNumber = Math.max(...orders.map((o) => o.number)) + 1;
      const order: Order = {
        id: `o${nextNumber}`,
        number: nextNumber,
        customerId: user?.customerId ?? "c1",
        customerName: recipientName || user?.name || "Cliente",
        ...(recipientPhone ? { recipientPhone } : {}),
        items,
        subtotal,
        deliveryFee,
        discount,
        total: Math.max(0, subtotal + deliveryFee - discount),
        status: "RECEBIDO",
        type,
        ...(type === "ENTREGA" && address ? { address } : {}),
        paymentMethod,
        createdAt: new Date().toISOString(),
        etaMinutes: etaMinutes ?? (type === "ENTREGA" ? 40 : 20),
        ...(note ? { note } : {}),
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      pushNotification({
        audience: "ADMIN",
        title: `Novo pedido #${order.number}`,
        message: `${order.customerName} — ${items.length} itens aguardando preparação.`,
        tone: "warning",
      });
      return order;
    },
    [cart, products, unitPriceOf, orders, user, pushNotification],
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }, []);

  const savePromotion = useCallback((promo: Promotion) => {
    setPromotions((prev) => {
      const exists = prev.some((p) => p.id === promo.id);
      return exists ? prev.map((p) => (p.id === promo.id ? promo : p)) : [promo, ...prev];
    });
  }, []);

  const savePromotions = useCallback((list: Promotion[]) => {
    setPromotions((prev) => [...list, ...prev.filter((p) => !list.some((n) => n.id === p.id))]);
  }, []);

  const removePromotion = useCallback(
    (id: string) => setPromotions((prev) => prev.filter((p) => p.id !== id)),
    [],
  );

  // ⚠️ ATUALIZAÇÃO DE ESTOQUE PELO ADMIN: ao salvar (menu Estoque/Produtos), o produto é
  // substituído no estado global — todos os cards, selos "Últimas X" e limites do carrinho
  // dos clientes passam a usar o novo valor imediatamente (e ele fica salvo no navegador).
  const saveProduct = useCallback((raw: Product) => {
    const product = normalizeStock(raw);
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev];
    });
  }, []);

  const removeProduct = useCallback(
    (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id)),
    [],
  );

  const setPendingStatus = useCallback((id: string, status: PendingPayment["status"]) => {
    setPendings((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const markAllRead = useCallback((audience: "CUSTOMER" | "ADMIN") => {
    setNotifications((prev) =>
      prev.map((n) => (n.audience === audience ? { ...n, read: true } : n)),
    );
  }, []);

  const customer = useMemo(
    () => customers.find((c) => c.id === user?.customerId) ?? null,
    [customers, user],
  );

  const value: AppState = {
    loading,
    user,
    customer,
    products,
    promotions,
    orders,
    customers,
    pendings,
    notifications,
    cart,
    login,
    logout,
    addToCart,
    updateCartLine,
    unitPriceOf,
    clearCart,
    stockLeft,
    stockOf,
    cartCount,
    cartSubtotal,
    placeOrder,
    updateOrderStatus,
    savePromotion,
    savePromotions,
    removePromotion,
    saveProduct,
    removeProduct,
    setPendingStatus,
    markAllRead,
    pushNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp precisa estar dentro de AppProvider");
  return ctx;
}

export function usePriceOf() {
  const { products, promotions } = useApp();
  return useCallback(
    (productId: string) => {
      const promo = promotions.find((p) => isPromoLive(p) && p.productId === productId);
      const base = products.find((p) => p.id === productId)?.price ?? 0;
      return { price: promo ? promo.newPrice : base, oldPrice: promo ? promo.oldPrice : null };
    },
    [products, promotions],
  );
}

export const levelPerks: Record<LoyaltyLevel, string[]> = {
  CLIENTE: ["1 ponto a cada R$ 1", "Cupom de boas-vindas", "Ofertas semanais"],
  VIP: ["5% de desconto progressivo", "Cupons personalizados", "Frete reduzido"],
  BLACK: ["10% de desconto progressivo", "Frete grátis", "Pré-venda de combos exclusivos"],
};

export const nextLevel: Record<LoyaltyLevel, { level: LoyaltyLevel; points: number } | null> = {
  CLIENTE: { level: "VIP", points: 500 },
  VIP: { level: "BLACK", points: 1200 },
  BLACK: null,
};

/** Agrupa sabores repetidos: ["Uva", "Uva", "Menta"] -> "2x Uva, 1x Menta" */
export function groupFlavors(flavors: string[]) {
  const counts = new Map<string, number>();
  flavors.forEach((f) => counts.set(f, (counts.get(f) ?? 0) + 1));
  return [...counts].map(([f, n]) => `${n}x ${f}`).join(", ");
}

export function comboPrice(opts: ProductOptions, sel: ComboSelection) {
  if (opts.kind !== "combo") return 0;
  const w = opts.whiskies.find((x) => x.label === sel.whisky)?.price ?? 0;
  const off = Math.round(w * (1 - opts.whiskyDiscountPercent / 100) * 100) / 100;
  return off + opts.energeticoQty * opts.energeticoPrice + opts.geloQty * opts.geloPrice;
}

export function groupCounts(c: Record<string, number>) {
  return Object.entries(c)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([f, n]) => `${n}x ${f}`)
    .join(", ");
}

export function comboLines(sel: ComboSelection) {
  return [
    `1x ${sel.whisky} (5% OFF aplicado)`,
    `Energéticos: ${groupCounts(sel.energeticos)}`,
    `Gelos: ${groupCounts(sel.gelos)}`,
  ];
}

export function describeVariation(name: string, item: CartItem) {
  if (item.combo) return `${name} — ${comboLines(item.combo).join("; ")}`;
  if (item.size) return `${name} - ${item.size}`;
  if (item.flavors?.length) return `${name} (${groupFlavors(item.flavors)})`;
  return name;
}
