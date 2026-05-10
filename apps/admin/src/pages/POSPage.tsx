import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { useState } from "react";

export default function POSPage() {
  const qc = useQueryClient();
  const { data: menu } = useQuery({ queryKey: ["menu"], queryFn: api.getMenu });
  const { data: tables } = useQuery({ queryKey: ["tables"], queryFn: api.getTables });
  const { data: active } = useQuery({ queryKey: ["pos-active"], queryFn: api.getPosActive, refetchInterval: 10000 });

  const [cart, setCart] = useState<{ menuItemId: string; name: string; quantity: number; price: number }[]>([]);
  const [tableId, setTableId] = useState("");

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) return prev.map((c) => (c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      return [...prev, { menuItemId: item.id, name: item.name, quantity: 1, price: Number(item.price) }];
    });
  };

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const orderMut = useMutation({
    mutationFn: () => api.posCreateOrder({ items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })), tableId: tableId || undefined }),
    onSuccess: () => { setCart([]); setTableId(""); qc.invalidateQueries({ queryKey: ["pos-active"] }); },
  });

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">نقاط البيع</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {menu?.filter((m: any) => m.available).map((item: any) => (
            <button key={item.id} onClick={() => addToCart(item)} className="bg-white rounded-lg shadow p-3 text-right hover:bg-gray-50">
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-gray-500">{formatPrice(Number(item.price))}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-80">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">السلة</h2>
          <div className="space-y-2 mb-3">
            {cart.map((c, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{c.name} × {c.quantity}</span>
                <span>{formatPrice(c.price * c.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="font-bold mb-3">{formatPrice(total)}</div>
          <select value={tableId} onChange={(e) => setTableId(e.target.value)} className="w-full border rounded px-3 py-2 mb-3">
            <option value="">بدون طاولة</option>
            {tables?.map((t: any) => <option key={t.id} value={t.id}>طاولة {t.number}</option>)}
          </select>
          <button onClick={() => orderMut.mutate()} disabled={cart.length === 0} className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50">إتمام الطلب</button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mt-4">
          <h2 className="font-bold mb-3">الطلبات النشطة</h2>
          {active?.map((o: any) => (
            <div key={o.id} className="text-sm border-b py-2">
              <div className="flex justify-between">
                <span>#{o.id.slice(0, 6)}</span>
                <span>{o.status}</span>
              </div>
              <div className="text-gray-500">{formatPrice(Number(o.total))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
