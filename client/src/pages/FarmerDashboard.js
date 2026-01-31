import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import farmerService from '../services/farmerService';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const profileResponse = await farmerService.getMyProfile();
        setFarmerProfile(profileResponse.data.user);
      } catch (error) {
        console.error(error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-colors duration-200">
        <div className="h-16 flex items-center px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-xl">
          Livestock360
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            ['Dashboard', '/farmer/dashboard'],
            ['Livestock', '/farmer/livestock'],
            ['Products', '/farmer/products'],
            ['Milk Production', '/farmer/milk-production'],
            ['Staff', '/farmer/staff'],
            ['Reports', '/farmer/reports'],
          ].map(([label, path]) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-green-100 hover:text-green-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-green-400 transition font-medium"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <div
            onClick={() => navigate('/farmer/profile')}
            className="cursor-pointer group mb-2"
          >
            <p className="text-xl font-bold dark:text-white group-hover:text-green-600 transition-colors flex items-center">
              {farmerProfile.name}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">View Profile</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here’s an overview of your farm.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Livestock */}
          <StatCard
            title="Total Livestock"
            value={farmerProfile.livestock?.length || 0}
            color="green"
          />

          {/* Products */}
          <StatCard
            title="Products Listed"
            value={farmerProfile.crops?.length || 0}
            color="blue"
          />

          {/* Milk */}
          <StatCard
            title="Milk Today"
            value="0 L"
            color="yellow"
          />

          {/* Farm Size */}
          <StatCard
            title="Farm Size"
            value={`${farmerProfile.farmSize} acres`}
            color="purple"
          />
        </div>
      </main>
    </div>
  );
};

/* Reusable Card Component */
const StatCard = ({ title, value, color }) => {
  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">
      <div className="p-6 flex items-center gap-5">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colors[color]} dark:opacity-90`}>
          <span className="text-lg font-bold">{value.toString()[0]}</span>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
