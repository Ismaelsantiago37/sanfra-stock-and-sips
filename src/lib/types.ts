/**
 * Entidades conceituais da plataforma.
 * Modeladas para espelhar as futuras tabelas do banco de dados
 * (Users, Customers, Products, Categories, Orders, OrderItems, Payments,
 * Promotions, Coupons, LoyaltyPoints, LoyaltyLevels, CustomerPurchases,
 * PendingPayments, Notifications, DeliveryAddresses).
 */

export type UserRole = "CUSTOMER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  customerId?: string | undefined;
}

export type LoyaltyLevel = "CLIENTE" | "VIP" | "BLACK";

export interface DeliveryAddress {
  id: string;
  customerId: string;
  label: string;
  street: string;
  number: string;
  district: string;
  city: string;
  complement?: string | undefined;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  /** compras por mês (frequência) */
  frequency: number;
  lastPurchaseAt: string;
  level: LoyaltyLevel;
  points: number;
  couponsUsed: number;
  favoriteCategory: CategoryId;
}

export type CategoryId =
  | "cervejas"
  | "destilados"
  | "whisky"
  | "licores"
  | "importados"
  | "energeticos"
  | "refrigerantes"
  | "agua"
  | "gelo"
  | "combos"
  | "narguile"
  | "essencias"
  | "outros";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: CategoryId;
  image: string;
  stock: number;
  timesOrdered: number;
  active: boolean;
  /** Variações escolhidas na hora da compra: sabores (por unidade) ou tamanhos com preço */
  options?: ProductOptions | undefined;
  /** Aluguel (ex.: narguilé): valores por hora/dia e juros de atraso na devolução */
  rental?:
    | {
        hourly: number;
        daily: number;
        /** juros por dia de atraso na devolução, em % */
        lateInterestPercent: number;
        /** desconto para consumir no local em vez de alugar, em % */
        onSiteDiscountPercent: number;
      }
    | undefined;
}

export interface Promotion {
  id: string;
  title: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  expiresAt: string;
  availableQty: number | null;
  featured: boolean;
  active: boolean;
}

export type OrderStatus =
  | "RECEBIDO"
  | "EM_PREPARACAO"
  | "PRONTO"
  | "SAIU_ENTREGA"
  | "ENTREGUE"
  | "CANCELADO";

export type PaymentMethod = "PIX" | "CARTAO" | "DINHEIRO" | "FIADO";

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: number;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  type: "ENTREGA" | "RETIRADA";
  address?: string | undefined;
  paymentMethod: PaymentMethod;
  createdAt: string;
  etaMinutes: number;
  note?: string | undefined;
}

export type PendingStatus = "PENDENTE" | "PAGO" | "ATRASADO";

export interface PendingPayment {
  id: string;
  customerId: string;
  customerName: string;
  orderNumber: number;
  createdAt: string;
  dueDate: string;
  amount: number;
  status: PendingStatus;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: number;
  type: "PERCENT" | "VALUE";
  minLevel: LoyaltyLevel;
  expiresAt: string;
}

export interface AppNotification {
  id: string;
  audience: "CUSTOMER" | "ADMIN";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  tone: "info" | "success" | "warning";
}

export interface CartItem {
  productId: string;
  quantity: number;
  /** tamanho escolhido (produtos com opção de tamanho) */
  size?: string | undefined;
  /** um sabor por unidade (produtos com opção de sabor) */
  flavors?: string[] | undefined;
  /** montagem do combo (produtos com opção de combo) */
  combo?: ComboSelection | undefined;
}

export type ProductOptions =
  | { kind: "flavor"; flavors: string[] }
  | { kind: "size"; sizes: { label: string; price: number }[]; optionLabel?: string }
  | {
      kind: "combo";
      whiskies: { label: string; price: number }[];
      /** desconto aplicado ao whisky dentro do combo, em % */
      whiskyDiscountPercent: number;
      energeticos: string[];
      energeticoPrice: number;
      energeticoQty: number;
      gelos: string[];
      geloPrice: number;
      geloQty: number;
    };

export interface ComboSelection {
  whisky: string;
  energeticos: Record<string, number>;
  gelos: Record<string, number>;
}
