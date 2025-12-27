import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Register() {
  const [formData, setFormData] = useState({
    // 1️⃣ Personal Details
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",

    // 2️⃣ Location Details
    address: "",
    district: "",
    state: "",
    pincode: "",

    // 3️⃣ Farm Details (UNCHANGED)
    farmName: "",
    farmLocation: "",
    farmingType: "",
    landArea: "",

    // 4️⃣ Identity (UNCHANGED)
    aadhaar: "",
    idProof: null,

    // 5️⃣ Consent
    acceptTerms: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (!formData.acceptTerms) {
      return setError("Please accept Terms & Conditions");
    }

    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const res = await axios.post(
        `${API_URL}/api/farmers/register`,
        data
      );

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-8"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Farmer Registration
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* 1️⃣ Personal Details */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="fullName"
              placeholder="Full Name"
              required
              onChange={handleChange}
              className="input"
            />
            <input
              name="phone"
              placeholder="Mobile Number"
              required
              onChange={handleChange}
              className="input"
            />
            <input
              name="email"
              type="email"
              placeholder="Email ID"
              required
              onChange={handleChange}
              className="input"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="input"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              onChange={handleChange}
              className="input"
            />
          </div>
        </section>

        {/* 2️⃣ Location Details */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Location Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="address"
              placeholder="Village / Town"
              required
              onChange={handleChange}
              className="input"
            />
            <input
              name="district"
              placeholder="District"
              required
              onChange={handleChange}
              className="input"
            />
            <input
              name="state"
              placeholder="State"
              required
              onChange={handleChange}
              className="input"
            />
            <input
              name="pincode"
              placeholder="Pincode"
              required
              onChange={handleChange}
              className="input"
            />
          </div>
        </section>

        {/* 3️⃣ Farm Details (UNCHANGED) */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Farm Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="farmName"
              placeholder="Farm Name"
              required
              onChange={handleChange}
              className="input"
            />
            <input
              name="farmLocation"
              placeholder="Farm Location"
              required
              onChange={handleChange}
              className="input"
            />
            <select
              name="farmingType"
              required
              onChange={handleChange}
              className="input"
            >
              <option value="">Type of Farming</option>
              <option>Dairy</option>
              <option>Livestock</option>
              <option>Both</option>
            </select>
            <input
              name="landArea"
              placeholder="Total Land Area (optional)"
              onChange={handleChange}
              className="input"
            />
          </div>
        </section>

        {/* 4️⃣ Identity & Verification (UNCHANGED) */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Identity & Verification</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="aadhaar"
              placeholder="Aadhaar / Farmer ID"
              onChange={handleChange}
              className="input"
            />
            <input
              name="idProof"
              type="file"
              onChange={handleChange}
              className="input"
            />
          </div>
        </section>

        {/* 5️⃣ Consent */}
        <section className="flex items-center gap-2">
          <input type="checkbox" name="acceptTerms" onChange={handleChange} />
          <span className="text-sm">I accept Terms & Conditions</span>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already registered?{" "}
          <Link to="/login" className="text-green-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

/* Tailwind input shortcut */
const input =
  "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-300 outline-none";

export default Register;
