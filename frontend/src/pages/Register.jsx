import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { name, email, password, phone } = formData;
      const res = await axios.post(`${API_URL}/api/farmers/register`, { name, email, password, phone });
      const { token, farmer } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("farmer", JSON.stringify(farmer));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800">Create an account</h2>
          <p className="text-sm text-gray-500 mt-1">Register to start managing your farm and livestock.</p>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="sr-only">Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required placeholder="Full name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" />
            </div>

            <div>
              <label className="sr-only">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Email address" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" />
              <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" />
            </div>

            <div>
              <label className="sr-only">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="Mobile number" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60">{loading ? 'Creating...' : 'Create account'}</button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link></p>
        </div>

        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-8">
          <div className="text-white text-center px-6">
            <h3 className="text-3xl font-bold mb-2">Join Livestock360</h3>
            <p className="opacity-90">Keep livestock records, monitor production, and make data-driven decisions for your farm.</p>
            <img src="/assets/illustration.png" alt="farm" className="mx-auto mt-6 w-48 opacity-90" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
