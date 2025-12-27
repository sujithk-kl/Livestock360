import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthCard from "../components/AuthCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/customers/login`, { email, password });
      const { token, customer } = res.data || {};
      if (token) localStorage.setItem("customerToken", token);
      if (customer) localStorage.setItem("customer", JSON.stringify(customer));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Customer Sign In" subtitle="" maxWidth="420px">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="text-red-600 text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="you@example.com"
            className={input}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder="••••••••"
            className={input}
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 shadow-lg hover:from-green-600 active:scale-95 transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="flex justify-between text-sm">
          <Link to="/customer/register" className="text-green-600 font-medium hover:text-green-700 hover:underline">Create account</Link>
          <Link to="#" className="text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</Link>
        </div>
      </form>
    </AuthCard>
  );
}

const input =
  "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 " +
  "focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 " +
  "hover:border-green-300 transition duration-200";

export default CustomerLogin;
