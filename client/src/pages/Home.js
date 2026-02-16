import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import homeBg from '../assets/tamil_nadu_farm_4k.jpg';
import Footer from '../components/Footer';
import farmerImg from '../assets/farmer_card.png';
import customerImg from '../assets/customer_card.png';
import { ChevronDownIcon, UserGroupIcon, ShoppingBagIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 transition-colors duration-300">

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${homeBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.5}px)`, // Parallax effect
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-900/90 dark:to-gray-900"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto w-full pt-16 pb-12">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 font-serif text-white tracking-tight drop-shadow-2xl">
              {t('welcome_title')}<span className="text-primary-400">360</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-light text-gray-200 leading-relaxed drop-shadow-md">
              {t('welcome_subtitle')}
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Farmer Card */}
            <div
              onClick={() => navigate('/farmer/login')}
              className="group relative bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-primary-400/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-full h-56 mb-6 rounded-2xl overflow-hidden shadow-lg relative group-hover:shadow-primary-500/20">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                  <img src={farmerImg} alt="Farmer" className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold tracking-wide shadow-lg transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 opacity-90 group-hover:opacity-100 flex items-center justify-center gap-2">
                  <span>{t('role_farmer_btn')}</span>
                  <ShoppingBagIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Customer Card */}
            <div
              onClick={() => navigate('/customer/login')}
              className="group relative bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-secondary-400/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-full h-56 mb-6 rounded-2xl overflow-hidden shadow-lg relative group-hover:shadow-secondary-500/20">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                  <img src={customerImg} alt="Customer" className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="w-full py-4 bg-secondary-600 hover:bg-secondary-500 text-white rounded-xl font-bold tracking-wide shadow-lg transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 opacity-90 group-hover:opacity-100 flex items-center justify-center gap-2">
                  <span>{t('role_customer_btn')}</span>
                  <UserGroupIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce text-white/50 hidden md:block">
          <ChevronDownIcon className="w-10 h-10" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-50 dark:bg-gray-800 py-16 border-b border-primary-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Active Farmers', value: '500+' },
            { label: 'Happy Customers', value: '10k+' },
            { label: 'Products', value: '1,200+' },
            { label: 'Cities Covered', value: '25+' },
          ].map((stat, idx) => (
            <div key={idx} className="p-4">
              <div className="text-3xl md:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2 font-serif">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-serif">{t('features_title')}</h2>
            <div className="w-24 h-1.5 bg-secondary-500 mx-auto rounded-full"></div>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light">{t('features_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: ShieldCheckIcon,
                title: t('feature_quality_title'),
                desc: t('feature_quality_desc'),
                color: 'text-primary-600',
                bg: 'bg-primary-50 dark:bg-primary-900/30'
              },
              {
                icon: ChartBarIcon,
                title: t('feature_analytics_title'),
                desc: t('feature_analytics_desc'),
                color: 'text-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/30'
              },
              {
                icon: ShoppingBagIcon,
                title: t('feature_market_title'),
                desc: t('feature_market_desc'),
                color: 'text-secondary-600',
                bg: 'bg-secondary-50 dark:bg-secondary-900/30'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-gray-50 dark:bg-gray-800 p-8 rounded-3xl transition-all duration-300 hover:shadow-card hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                <div className={`w-20 h-20 ${feature.bg} rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-10 h-10 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-serif text-center">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
