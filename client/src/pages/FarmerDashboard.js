import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import farmerService from '../services/farmerService';
import {
  CubeIcon,
  BeakerIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLivestock: 0,
    productsListed: 0,
    milkToday: 0,
    farmSize: 0
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const [profileResponse, statsResponse] = await Promise.all([
          farmerService.getMyProfile(),
          farmerService.getDashboardStats()
        ]);

        setFarmerProfile(profileResponse.data.user);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

      } catch (error) {
        console.error(error);
        if (!farmerProfile) {
          // navigate('/login'); 
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">{t('dashboard_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard_welcome')}
          </p>
        </div>
      </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title={t('stat_livestock')}
              value={stats.totalLivestock}
              icon={CubeIcon}
              color="emerald"
            />
            <StatCard
              title={t('stat_products')}
              value={stats.productsListed}
              icon={BeakerIcon}
              color="blue"
            />
            <StatCard
              title={t('stat_milk')}
              value={`${stats.milkToday} L`}
              icon={BeakerIcon} // Could use a specific icon if available
              color="amber"
            />

            <StatCard
              title={t('stat_farm_size')}
              value={`${stats.farmSize || farmerProfile?.farmSize || 0} ac`}
              icon={HomeIcon}
              color="purple"
            />
          </div>

          {/* Recent Activity / Placeholder Area - simplified for now */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('quick_actions')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/farmer/livestock')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-center border border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-300">
                <span className="block font-medium">{t('action_add_livestock')}</span>
              </button>
              <button onClick={() => navigate('/farmer/products')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-300">
                <span className="block font-medium">{t('action_list_product')}</span>
              </button>
              <button onClick={() => navigate('/farmer/milk-production')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center border border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-300">
                <span className="block font-medium">{t('action_record_milk')}</span>
              </button>
              <button onClick={() => navigate('/farmer/sales-report')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-center border border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-300">
                <span className="block font-medium">{t('action_view_sales')}</span>
              </button>
            </div>
        </div>
    </div>
  );
};

/* Reusable Card Component */
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.emerald}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
