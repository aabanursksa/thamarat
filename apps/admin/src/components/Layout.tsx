import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

const links = [
  { to: "/", label: "الطلبات" },
  { to: "/menu", label: "القائمة" },
  { to: "/tables", label: "الطاولات" },
  { to: "/pos", label: "نقاط البيع" },
  { to: "/reports", label: "التقارير" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-gray-700">🍽️ لوحة التحكم</div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm">
          <div>{user?.name}</div>
          <button onClick={logout} className="text-red-400 hover:text-red-300 mt-1">تسجيل الخروج</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
