import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { useState } from "react";

export default function MenuPage() {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["menu"], queryFn: api.getMenu });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: api.getCategories });
  const [edit, setEdit] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const delMut = useMutation({
    mutationFn: api.deleteMenuItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });

  const catDelMut = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">القائمة</h1>
        <button onClick={() => { setEdit(null); setShowForm(true); }} className="bg-gray-900 text-white px-4 py-2 rounded text-sm">+ إضافة صنف</button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">التصنيفات</h2>
        <div className="flex flex-wrap gap-2">
          {categories?.map((c: any) => (
            <div key={c.id} className="bg-white rounded-lg shadow px-3 py-2 flex items-center gap-2">
              <span>{c.name}</span>
              <button onClick={() => catDelMut.mutate(c.id)} className="text-red-500 text-xs">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item: any) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category?.name}</p>
              </div>
              <span className="font-bold">{formatPrice(Number(item.price))}</span>
            </div>
            {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setEdit(item); setShowForm(true); }} className="text-sm text-blue-600">تعديل</button>
              <button onClick={() => delMut.mutate(item.id)} className="text-sm text-red-600">حذف</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <MenuItemForm item={edit} onClose={() => setShowForm(false)} categories={categories || []} />}
    </div>
  );
}

function MenuItemForm({ item, onClose, categories }: { item: any; onClose: () => void; categories: any[] }) {
  const qc = useQueryClient();
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price || "");
  const [categoryId, setCategoryId] = useState(item?.categoryId || categories[0]?.id || "");
  const [description, setDescription] = useState(item?.description || "");

  const mut = useMutation({
    mutationFn: (data: any) => item ? api.updateMenuItem(item.id, data) : api.createMenuItem(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["menu"] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{item ? "تعديل صنف" : "إضافة صنف"}</h2>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" className="w-full border rounded px-3 py-2" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="السعر" type="number" className="w-full border rounded px-3 py-2" />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border rounded px-3 py-2">
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف" className="w-full border rounded px-3 py-2" />
          <button onClick={() => mut.mutate({ name, price: parseFloat(price), categoryId, description })} className="w-full bg-gray-900 text-white py-2 rounded">
            {item ? "تحديث" : "إضافة"}
          </button>
        </div>
      </div>
    </div>
  );
}
