import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price_frw: number;
  image_url: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "kora-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* noop */
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const total = items.reduce((s, i) => s + i.quantity * i.price_frw, 0);
    return {
      items,
      count,
      total,
      isOpen,
      setOpen,
      add: (item, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.id === item.id);
          if (existing) {
            return prev.map((p) =>
              p.id === item.id ? { ...p, quantity: p.quantity + qty } : p,
            );
          }
          return [...prev, { ...item, quantity: qty }];
        }),
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      setQuantity: (id, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => p.id !== id)
            : prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p)),
        ),
      clear: () => setItems([]),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildCartMessage(items: CartItem[]): string {
  const lines: string[] = [];
  lines.push("Hello Kora Design! I would like to order:");
  lines.push("");
  items.forEach((item, idx) => {
    const lineTotal = item.price_frw * item.quantity;
    lines.push(
      `${idx + 1}. ${item.name}\n` +
        `   Qty: ${item.quantity} × ${item.price_frw.toLocaleString("en-US")} FRW = ${lineTotal.toLocaleString("en-US")} FRW\n` +
        `   Image: ${item.image_url}`,
    );
  });
  const total = items.reduce((s, i) => s + i.price_frw * i.quantity, 0);
  lines.push("");
  lines.push(`Total: ${total.toLocaleString("en-US")} FRW`);
  return lines.join("\n");
}

export function buildSingleProductMessage(p: {
  name: string;
  price_frw: number;
  image_url: string;
}): string {
  return [
    "Hello Kora Design! I would like to buy:",
    "",
    `${p.name}`,
    `Price: ${p.price_frw.toLocaleString("en-US")} FRW`,
    `Image: ${p.image_url}`,
  ].join("\n");
}
