import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useState } from "react";

export default function TablesPage() {
  const qc = useQueryClient();
  const { data: tables } = useQuery({ queryKey: ["tables"], queryFn: api.getTables });
  const [showForm, setShowForm] = useState(false);
  const [editNum, setEditNum] = useState("");

  const createMut = useMutation({
    mutationFn: (data: any) => api.createTable(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tables"] }); setShowForm(false); setEditNum(""); },
  });

  const delMut = useMutation({
    mutationFn: api.deleteTable,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">الطاولات</h1>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white px-4 py-2 rounded text-sm">+ إضافة طاولة</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables?.map((t: any) => (
          <div key={t.id} className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">🪑</div>
            <div className="font-bold text-lg">طاولة {t.number}</div>
            <div className="text-sm text-gray-500">{t._count?.orders || 0} طلب</div>
            <button onClick={() => delMut.mutate(t.id)} className="text-sm text-red-600 mt-2">حذف</button>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">إضافة طاولة</h2>
            <input value={editNum} onChange={(e) => setEditNum(e.target.value)} placeholder="رقم الطاولة" type="number" className="w-full border rounded px-3 py-2 mb-3" />
            <button onClick={() => createMut.mutate({ number: parseInt(editNum) })} className="w-full bg-gray-900 text-white py-2 rounded">إضافة</button>
          </div>
        </div>
      )}
    </div>
  );
}
