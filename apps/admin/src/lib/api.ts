const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; refreshToken: string; user: { id: string; email: string; name: string; role: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) }),
  getMenu: () => request<any[]>("/menu"),
  createMenuItem: (data: any) => request("/menu", { method: "POST", body: JSON.stringify(data) }),
  updateMenuItem: (id: string, data: any) => request(`/menu/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMenuItem: (id: string) => request(`/menu/${id}`, { method: "DELETE" }),
  getCategories: () => request<any[]>("/categories"),
  createCategory: (data: any) => request("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request(`/categories/${id}`, { method: "DELETE" }),
  getOrders: (status?: string) => request<any[]>(`/orders${status ? `?status=${status}` : ""}`),
  getOrder: (id: string) => request<any>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getTables: () => request<any[]>("/tables"),
  createTable: (data: any) => request("/tables", { method: "POST", body: JSON.stringify(data) }),
  updateTable: (id: string, data: any) => request(`/tables/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTable: (id: string) => request(`/tables/${id}`, { method: "DELETE" }),
  posCreateOrder: (data: any) => request("/pos/order", { method: "POST", body: JSON.stringify(data) }),
  getPosActive: () => request<any[]>("/pos/active"),
  getSalesReport: (dateFrom?: string, dateTo?: string) =>
    request<any>(`/reports/sales?dateFrom=${dateFrom || ""}&dateTo=${dateTo || ""}`),
};
