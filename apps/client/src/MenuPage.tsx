import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./api";

export default function MenuPage() {
  const [cart, setCart] = useState<{ menuItemId: string; name: string; price: number; quantity: number }[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { data: menu } = useQuery({ queryKey: ["menu"], queryFn: api.getMenu });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: api.getCategories });

  const orderMut = useMutation({
    mutationFn: () => api.createOrder({ items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })) }),
    onSuccess: (data) => { setOrderId(data.id); setCart([]); },
  });

  const addItem = (item: any) => {
    setCart((prev) => {
      const exist = prev.find((c) => c.menuItemId === item.id);
      return exist
        ? prev.map((c) => (c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c))
        : [...prev, { menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  };

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  if (orderId) return <OrderTracker orderId={orderId} />;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">🍽️ قائمة الطعام</h1>
      </header>

      {categories?.map((cat: any) => {
        const items = menu?.filter((m: any) => m.categoryId === cat.id && m.available) || [];
        if (!items.length) return null;
        return (
          <section key={cat.id} className="mb-6">
            <h2 className="text-xl font-bold mb-3">{cat.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.price.toFixed(2)} د.ل</div>
                  </div>
                  <button onClick={() => addItem(item)} className="bg-gray-900 text-white px-3 py-1 rounded text-sm">+ أضف</button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">الطلبية ({cart.reduce((s, c) => s + c.quantity, 0)} صنف)</span>
              <span className="font-bold">{total.toFixed(2)} د.ل</span>
            </div>
            <div className="text-sm space-y-1 mb-2">
              {cart.map((c) => (
                <div key={c.menuItemId} className="flex justify-between">
                  <span>{c.name} × {c.quantity}</span>
                  <button onClick={() => removeItem(c.menuItemId)} className="text-red-500 text-xs">✕</button>
                </div>
              ))}
            </div>
            <button onClick={() => orderMut.mutate()} disabled={orderMut.isPending} className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50">
              {orderMut.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderTracker({ orderId }: { orderId: string }) {
  const { data: order, isPending } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.getOrder(orderId),
    refetchInterval: 5000,
  });

  if (isPending) return <div className="text-center p-8">جاري التحميل...</div>;

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      <div className="text-4xl mb-4">📋</div>
      <h1 className="text-2xl font-bold mb-2">تم استلام الطلب!</h1>
      <p className="text-gray-500 mb-4">رقم الطلب: {orderId.slice(0, 8)}</p>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-lg font-semibold mb-2">الحالة: {order?.status}</div>
        <div className="text-3xl font-bold text-green-600">{Number(order?.total || 0).toFixed(2)} د.ل</div>
      </div>
      <div className="mt-6 space-y-2">
        {["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED"].map((s) => (
          <div key={s} className={`p-2 rounded text-sm ${order?.status === s ? "bg-green-100 text-green-800 font-bold" : order && ["CONFIRMED", "PREPARING", "READY", "COMPLETED"].indexOf(s) <= ["CONFIRMED", "PREPARING", "READY", "COMPLETED"].indexOf(order.status) ? "bg-gray-100" : "bg-gray-50 text-gray-400"}`}>
            {s === "PENDING" && "⏳ قيد الانتظار"}
            {s === "CONFIRMED" && "✅ تم التأكيد"}
            {s === "PREPARING" && "👨‍🍳 قيد التحضير"}
            {s === "READY" && "🍽️ جاهز"}
            {s === "COMPLETED" && "✔️ مكتمل"}
          </div>
        ))}
      </div>
    </div>
  );
}
