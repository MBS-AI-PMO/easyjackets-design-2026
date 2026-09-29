import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'ej-cart';

const read = () => { try { const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
const write = (items) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* private mode */ } };

// One line per product + size + color choice. `id` is the catalogue product's
// _id (what the checkout API expects); custom designs carry `designId` instead.
const lineKey = (l) => [l.id || '', l.designId || '', l.size || '', l.color || ''].join('|');

/** The shopping cart, kept in localStorage so it survives reloads and sign-in. */
export function CartProvider({ children }) {
  const [items, setItems] = useState(read);
  useEffect(() => { write(items); }, [items]);

  const add = useCallback((line, qty = 1) => {
    setItems((prev) => {
      const key = lineKey(line);
      const i = prev.findIndex((l) => lineKey(l) === key);
      if (i === -1) return [...prev, { ...line, quantity: Math.max(1, qty) }];
      return prev.map((l, j) => (j === i ? { ...l, quantity: l.quantity + qty } : l));
    });
  }, []);
  const setQuantity = useCallback((key, quantity) => setItems((prev) => prev.map((l) => (lineKey(l) === key ? { ...l, quantity } : l)).filter((l) => l.quantity > 0)), []);
  const remove = useCallback((key) => setItems((prev) => prev.filter((l) => lineKey(l) !== key)), []);
  const clear = useCallback(() => setItems([]), []);
  // a builder design changed after it was added (edited in the builder): new price, size or image
  const updateDesign = useCallback((designId, fields) => setItems((prev) => prev.map((l) => (l.designId === designId && !l.id ? { ...l, ...fields } : l))), []);

  const value = useMemo(() => {
    const count = items.reduce((n, l) => n + l.quantity, 0);
    const subtotal = items.reduce((n, l) => n + l.quantity * (Number(l.price) || 0), 0);
    return { items: items.map((l) => ({ ...l, key: lineKey(l) })), count, subtotal, add, setQuantity, remove, clear, updateDesign };
  }, [items, add, setQuantity, remove, clear, updateDesign]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
