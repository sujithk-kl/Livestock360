import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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
      if (token) localStorage.setItem('customerToken', token);
      if (customer) localStorage.setItem('customer', JSON.stringify(customer));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-green-700">Sign In as Customer</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="you@example.com" className={input} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" placeholder="" className={input} />
        </div>

        <button disabled={loading} type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center">
          <Link to="/customer/register" className="text-green-600 font-medium">Switch to Sign Up</Link>
        </div>
        <div className="text-center">
          <Link to="#" className="text-green-600">Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
}

const input = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300 outline-none";

export default CustomerLogin;

