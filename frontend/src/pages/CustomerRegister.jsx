import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthCard from "../components/AuthCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CustomerRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/customers/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate('/customer/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 flex justify-center">
    <AuthCard title="Customer Sign Up" subtitle="Create your account" maxWidth="420px">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className={input} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="you@example.com" className={input} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input name="password" value={form.password} onChange={handleChange} required type="password" placeholder="Create a password" className={input} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required type="password" placeholder="Confirm password" className={input} />
        </div>

        <button disabled={loading} type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">{loading ? 'Signing up...' : 'Sign Up'}</button>

        <div className="text-center">
          <p className="text-sm text-gray-600">Already have an account?</p>
          <Link to="/customer/login" className="text-green-600 font-medium">Switch to Sign In</Link>
        </div>
      </form>
    </AuthCard>
    </div>
  );
}

const input = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-300 outline-none";

export default CustomerRegister;
