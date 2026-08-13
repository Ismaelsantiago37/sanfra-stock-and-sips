import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import * as mock from "./mock-data";
import type {
  AppNotification,
  CartItem,
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
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  // orders
  placeOrder: (input: {
    type: "ENTREGA" | "RETIRADA";
    address?: string;
    paymentMethod: PaymentMethod;
    note?: string;
    discount?: number;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  // promotions
  savePromotion: (promo: Promotion) => void;
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

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "adega-state-v1";

interface Persisted {
  userId: string | null;
  cart: CartItem[];
  orders: Order[];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(mock.products);
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
    const payload: Persisted = { userId: user?.id ?? null, cart, orders };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [user, cart, orders, loading]);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const found = mock.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || password.length < 4) throw new Error("E-mail ou senha inválidos.");
    setUser(found);
    return found;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing)
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      return [...prev, { productId, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const priceOf = useCallback(
    (productId: string) => {
      const promo = promotions.find((p) => p.active && p.productId === productId);
      if (promo) return promo.newPrice;
      return products.find((p) => p.id === productId)?.price ?? 0;
    },
    [products, promotions],
  );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + priceOf(i.productId) * i.quantity, 0);

  const pushNotification = useCallback((n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [
      { ...n, id: `n${Date.now()}`, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const placeOrder: AppState["placeOrder"] = useCallback(
    ({ type, address, paymentMethod, note, discount = 0 }) => {
      const items = cart.map((i) => {
        const p = products.find((x) => x.id === i.productId)!;
        return {
          productId: p.id,
          name: p.name,
          unitPrice: priceOf(p.id),
          quantity: i.quantity,
        };
      });
      const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const deliveryFee = type === "ENTREGA" ? 6 : 0;
      const nextNumber = Math.max(...orders.map((o) => o.number)) + 1;
      const order: Order = {
        id: `o${nextNumber}`,
        number: nextNumber,
        customerId: user?.customerId ?? "c1",
        customerName: user?.name ?? "Cliente",
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
        etaMinutes: type === "ENTREGA" ? 40 : 20,
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
    [cart, products, priceOf, orders, user, pushNotification],
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

  const removePromotion = useCallback(
    (id: string) => setPromotions((prev) => prev.filter((p) => p.id !== id)),
    [],
  );

  const saveProduct = useCallback((product: Product) => {
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
    setQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    placeOrder,
    updateOrderStatus,
    savePromotion,
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
      const promo = promotions.find((p) => p.active && p.productId === productId);
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
