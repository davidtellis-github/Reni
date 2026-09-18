"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

type Ctx = {
  lines: CartLine[]; open: boolean; setOpen: (v: boolean) => void;
  add: (id: string, max: number) => boolean; change: (id: string, d: number, max: number) => boolean; clear: () => void;
  count: number;
};
const C = createContext<Ctx | null>(null);
export const useCart = () => { const c = useContext(C); if (!c) throw new Error("CartProvider missing"); return c; };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setLines(JSON.parse(localStorage.getItem("kfa_cart") || "[]")); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem("kfa_cart", JSON.stringify(lines)); } catch {} }, [lines, ready]);

  const api = useMemo<Ctx>(() => ({
    lines, open, setOpen,
    add(id, max) { const l = lines.find((x) => x.id === id); const cur = l?.qty || 0; if (cur + 1 > max) return false;
      setLines(l ? lines.map((x) => x.id === id ? { ...x, qty: x.qty + 1 } : x) : [...lines, { id, qty: 1 }]); setOpen(true); return true; },
    change(id, d, max) { const l = lines.find((x) => x.id === id); if (!l) return false; if (d > 0 && l.qty + 1 > max) return false;
      const q = l.qty + d; setLines(q <= 0 ? lines.filter((x) => x.id !== id) : lines.map((x) => x.id === id ? { ...x, qty: q } : x)); return true; },
    clear() { setLines([]); },
    count: lines.reduce((a, l) => a + l.qty, 0),
  }), [lines, open]);
  return <C.Provider value={api}>{children}</C.Provider>;
}
