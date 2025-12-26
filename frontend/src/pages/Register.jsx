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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    // Call backend register
    (async () => {
      try {
        const { name, email, password, phone } = formData;
        const res = await axios.post(`${API_URL}/api/farmers/register`, { name, email, password, phone });
        const { token, farmer } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("farmer", JSON.stringify(farmer));
        navigate("/dashboard");
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      }
    })();
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Farmer Registration
        </h2>

        <p className="text-center text-gray-500 mt-2">
          Register to manage your dairy and livestock details
        </p>

        {error && (
          <p className="text-red-500 text-center mt-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          <input
            type="text"
            name="name"
            placeholder="Farmer Name"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Mobile Number"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?
          <Link
            to="/login"
            className="text-green-600 font-medium hover:underline ml-1"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
