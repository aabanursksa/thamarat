import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { useState } from "react";

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const { data } = useQuery({
    queryKey: ["sales-report", from, to],
    queryFn: () => api.getSalesReport(from, to),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">التقارير</h1>
      <div className="flex gap-3 mb-6">
        <div>
          <label className="text-sm text-gray-500">من</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-gray-500">إلى</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-3 py-2" />
        </div>
      </div>
      {data?.summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">إجمالي الطلبات</div>
            <div className="text-2xl font-bold">{data.summary.totalOrders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">إجمالي الإيرادات</div>
            <div className="text-2xl font-bold">{formatPrice(data.summary.totalRevenue)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">متوسط قيمة الطلب</div>
            <div className="text-2xl font-bold">{formatPrice(data.summary.averageOrderValue)}</div>
          </div>
        </div>
      )}
      {data?.items && (
        <div className="bg-white rounded-lg shadow">
          {data.items.map((i: any, idx: number) => (
            <div key={idx} className="flex justify-between px-4 py-2 border-b text-sm">
              <span>{i.date}</span>
              <span>{formatPrice(i.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
