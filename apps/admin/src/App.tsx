import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./lib/auth";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import MenuPage from "./pages/MenuPage";
import TablesPage from "./pages/TablesPage";
import POSPage from "./pages/POSPage";
import ReportsPage from "./pages/ReportsPage";

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 10000 } } });

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OrdersPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="tables" element={<TablesPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
