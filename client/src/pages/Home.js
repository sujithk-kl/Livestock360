import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import homeBg from '../assets/tamil_nadu_farm_4k.jpg';
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-bold font-serif mb-6 flex items-center">
              {t('welcome_title')}<span className="text-primary-500">360</span>
            </h2>
            <p className="text-gray-400 max-w-sm leading-relaxed mb-6">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4">
              {/* Facebook */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center group" aria-label="Facebook">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center group" aria-label="Twitter">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center group" aria-label="Instagram">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">{t('footer_quick_links')}</h4>
            <ul className="space-y-4 text-gray-400">
              {['About', 'Services', 'Contact', 'Privacy Policy'].map(item => (
                <li key={item}><a href="#" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                  {item}
                </a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">{t('footer_contact')}</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-primary-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=cyhawkzy@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">cyhawkzy@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-primary-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href="tel:+919361574492" className="hover:text-primary-400 transition-colors">+91 93615 74492</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Livestock360. All rights reserved.</p>
          <p>Designed for Farmers & Customers</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
