import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import farmerService from '../services/farmerService';
import NotificationBell from './NotificationBell';
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
  UserCircleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const FarmerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [farmerProfile, setFarmerProfile] = useState(null);
  
  // Sidebar state handles both mobile visibility and desktop toggling
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Default closed on mobile
      } else {
        setSidebarOpen(true); // Default open on desktop
      }
    };
    
    // Initial check
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const profileResponse = await farmerService.getMyProfile();
          setFarmerProfile(profileResponse.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch farmer profile for sidebar", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/farmer/login');
  };

  const navItems = [
    { label: t('side_dashboard'), path: '/farmer/dashboard', icon: HomeIcon },
    { label: 'Subscriptions', path: '/farmer/subscriptions', icon: ClipboardDocumentListIcon },
    { label: t('side_livestock'), path: '/farmer/livestock', icon: CubeIcon },
    { label: t('side_products'), path: '/farmer/products', icon: BeakerIcon },
    { label: t('side_milk'), path: '/farmer/milk-production', icon: ChartBarIcon },
    { label: t('side_staff'), path: '/farmer/staff', icon: UserGroupIcon },
    { label: t('side_reports'), path: '/farmer/reports', icon: DocumentTextIcon },
    { label: t('side_sales_report'), path: '/farmer/sales-report', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
      
      {/* Mobile/Shared Header - Shows the hamburger icon to toggle the sidebar */}
      <div className="fixed top-0 w-full bg-white dark:bg-gray-800 z-30 flex items-center justify-between px-4 h-16 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600 dark:text-gray-300 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
          <span className="font-bold text-lg font-serif text-gray-900 dark:text-white">
            Livestock<span className="text-primary-500">360</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4 hidden md:flex">
             <NotificationBell />
        </div>
        <div className="flex items-center gap-4 md:hidden">
            <NotificationBell />
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 transform mt-16
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl md:shadow-none
      `}>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 mb-16 md:mb-16">
          <div
            onClick={() => {
                navigate('/farmer/profile');
                if (isMobile) setSidebarOpen(false);
            }}
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

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 overflow-y-auto transition-all duration-300 mt-16 ${sidebarOpen && !isMobile ? 'ml-72' : 'ml-0'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default FarmerLayout;
