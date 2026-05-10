import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@restaurant.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      setError("بيانات الدخول غير صحيحة");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 w-96">
        <h1 className="text-2xl font-bold text-center mb-6">🍽️ تسجيل الدخول</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        <div className="space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full border rounded px-3 py-2" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="كلمة المرور" className="w-full border rounded px-3 py-2" />
          <button className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800">دخول</button>
        </div>
      </form>
    </div>
  );
}
