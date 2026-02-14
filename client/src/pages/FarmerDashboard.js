import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import farmerService from '../services/farmerService';
import NotificationBell from '../components/NotificationBell';
import {
  HomeIcon,
  CubeIcon,
  BeakerIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { label: t('side_dashboard'), path: '/farmer/dashboard', icon: HomeIcon },
    { label: t('side_livestock'), path: '/farmer/livestock', icon: CubeIcon },
    { label: t('side_products'), path: '/farmer/products', icon: BeakerIcon },
    { label: t('side_milk'), path: '/farmer/milk-production', icon: ChartBarIcon }, // Changed icon for variety
    { label: t('side_staff'), path: '/farmer/staff', icon: UserGroupIcon },
    { label: t('side_reports'), path: '/farmer/reports', icon: DocumentTextIcon },
    { label: 'Sales Report', path: '/farmer/sales-report', icon: ChartBarIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-gray-800 z-30 flex items-center justify-between px-4 h-16 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <span className="font-bold text-lg font-serif text-gray-900 dark:text-white">Livestock<span className="text-primary-500">360</span></span>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600 dark:text-gray-300 focus:outline-none">
            {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl md:shadow-none
      `}>
        <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-gray-700">
          <span className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Livestock<span className="text-primary-500">360</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div
            onClick={() => navigate('/farmer/profile')}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors shadow-sm hover:shadow-md mb-3 border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
          >
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
              {farmerProfile?.name?.charAt(0) || <UserCircleIcon className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{farmerProfile?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t('side_profile')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-900/30 transition-all font-medium shadow-sm"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {t('side_logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">{t('dashboard_title')}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {t('dashboard_welcome')}
              </p>
            </div>
            <div className="hidden md:block">
              <NotificationBell />
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/farmer/livestock')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-center border border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-300">
                <span className="block font-medium">Add Livestock</span>
              </button>
              <button onClick={() => navigate('/farmer/products')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-300">
                <span className="block font-medium">List Product</span>
              </button>
              <button onClick={() => navigate('/farmer/milk-production')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center border border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-300">
                <span className="block font-medium">Record Milk</span>
              </button>
              <button onClick={() => navigate('/farmer/sales-report')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-center border border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-300">
                <span className="block font-medium">View Sales</span>
              </button>
            </div>
          </div>
        </div>
      </main>
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
