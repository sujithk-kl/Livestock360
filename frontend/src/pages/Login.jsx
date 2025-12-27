import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/farmers/login`, { email, name, password });
      const { token, farmer } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("farmer", JSON.stringify(farmer));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-8">
          <div className="text-white text-center px-6">
            <h3 className="text-3xl font-bold mb-2">Livestock360</h3>
            <p className="opacity-90">Manage your farm, track milk production, and keep livestock data organized — all in one place.</p>
            <img src="/assets/illustration.png" alt="farm" className="mx-auto mt-6 w-48 opacity-90" />
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800">Farmer Login</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-600">
                <span>Password</span>
                <button type="button" onClick={() => setShow((s) => !s)} className="text-xs text-green-600 hover:underline">
                  {show ? "Hide" : "Show"}
                </button>
              </label>
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600" />
                Remember me
              </label>
              <Link to="#" className="text-green-600 hover:underline">Forgot password?</Link>
            </div>

            <div className="pt-4">
              <p className="text-center text-sm text-gray-500">Don’t have an account? <Link to="/register" className="text-green-600 font-medium hover:underline">Register</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
