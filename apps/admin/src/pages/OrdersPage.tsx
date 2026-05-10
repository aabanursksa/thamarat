import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatPrice, STATUS_COLORS } from "../lib/utils";
import { useState } from "react";

export default function OrdersPage() {
  const [filter, setFilter] = useState("");
  const qc = useQueryClient();
  const { data: orders } = useQuery({ queryKey: ["orders", filter], queryFn: () => api.getOrders(filter || undefined), refetchInterval: 15000 });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الطلبات</h1>
      <div className="flex gap-2 mb-4">
        {["", "PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded text-sm ${filter === s ? "bg-gray-900 text-white" : "bg-gray-200"}`}>
            {s || "الكل"}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {orders?.map((o: any) => (
          <div key={o.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm text-gray-500">#{o.id.slice(0, 8)}</span>
                {o.table && <span className="mr-3 text-sm">طاولة {o.table.number}</span>}
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[o.status] || ""}`}>{o.status}</span>
            </div>
            <div className="text-sm space-y-1 mb-3">
              {o.items?.map((i: any) => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.menuItem?.name} × {i.quantity}</span>
                  <span>{formatPrice(Number(i.unitPrice) * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">{formatPrice(Number(o.total))}</span>
              <div className="flex gap-1">
                {["CONFIRMED", "PREPARING", "READY", "COMPLETED"].map((s) => (
                  <button key={s} onClick={() => statusMut.mutate({ id: o.id, status: s })} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">{s}</button>
                ))}
                {o.status !== "CANCELLED" && (
                  <button onClick={() => statusMut.mutate({ id: o.id, status: "CANCELLED" })} className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700">إلغاء</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
