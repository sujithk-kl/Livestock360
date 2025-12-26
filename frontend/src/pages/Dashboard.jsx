import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Dashboard() {
  const [farmer, setFarmer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      try {
        const res = await axios.get(`${API_URL}/api/farmers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFarmer(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("farmer");
        navigate("/login");
      }
    };
    fetchMe();
  }, [navigate]);

  if (!farmer) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Welcome, {farmer.name}</h2>
      <p className="text-sm text-gray-600">{farmer.email}</p>
    </div>
  );
}

export default Dashboard;

