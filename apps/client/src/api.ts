const API = "/api";

export const api = {
  getMenu: () => fetch(`${API}/menu`).then((r) => r.json()),
  getCategories: () => fetch(`${API}/categories`).then((r) => r.json()),
  createOrder: (data: { items: { menuItemId: string; quantity: number }[]; tableId?: string }) =>
    fetch(`${API}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  getOrder: (id: string) => fetch(`${API}/orders/${id}`).then((r) => r.json()),
};
