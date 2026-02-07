import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import homeBg from '../assets/modern_farm_hero.png';
import farmerImg from '../assets/farmer_card.png';
import customerImg from '../assets/customer_card.png';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Hero Section */}
      {/* Hero Section */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden py-24 sm:py-0"
        style={{
          backgroundImage: `url(${homeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed' // Parallax effect
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-6 font-serif animate-fade-in-down drop-shadow-lg leading-tight mt-8 sm:mt-0">
            {t('welcome_title')}<span className="text-green-400">360</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md text-gray-100 md:translate-x-32">
            {t('welcome_subtitle')}
          </p>

          {/* Role Selection */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center w-full px-4">
            {/* Farmer Card */}
            <div
              onClick={() => navigate('/farmer/login')}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl w-full max-w-[340px] md:w-80 flex flex-col items-center"
            >
              <div className="w-full h-40 sm:h-48 mb-4 sm:mb-6 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                <img src={farmerImg} alt="Farmer" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 font-serif">{t('role_farmer_title')}</h2>
              <p className="text-gray-200 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">{t('role_farmer_desc')}</p>
              <button className="px-6 py-3 sm:py-2 bg-green-600 hover:bg-green-500 text-white rounded-full font-semibold transition-colors w-full text-base sm:text-lg shadow-md">
                {t('role_farmer_btn')}
              </button>
            </div>

            {/* Customer Card */}
            <div
              onClick={() => navigate('/customer/login')}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl w-full max-w-[340px] md:w-80 flex flex-col items-center"
            >
              <div className="w-full h-40 sm:h-48 mb-4 sm:mb-6 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                <img src={customerImg} alt="Customer" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 font-serif">{t('role_customer_title')}</h2>
              <p className="text-gray-200 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">{t('role_customer_desc')}</p>
              <button className="px-6 py-3 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-colors w-full text-base sm:text-lg shadow-md">
                {t('role_customer_btn')}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile as scrolling is natural */}
        <div className="absolute bottom-10 animate-bounce text-white/70 hidden md:block">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 sm:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 font-serif">{t('features_title')}</h2>
            <div className="w-20 h-1 bg-green-500 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">{t('features_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="bg-green-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{t('feature_quality_title')}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{t('feature_quality_desc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="bg-blue-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{t('feature_analytics_title')}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{t('feature_analytics_desc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="bg-orange-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{t('feature_market_title')}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{t('feature_market_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold font-serif mb-4 flex items-center">
              {t('welcome_title')}<span className="text-green-500">360</span>
            </h2>
            <p className="text-gray-400 max-w-sm">
              {t('footer_desc')}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200">{t('footer_quick_links')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer_link_about')}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer_link_services')}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer_link_contact')}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer_link_privacy')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200">{t('footer_contact')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                support@livestock360.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +91 98765 43210
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Livestock360. {t('footer_rights')}
        </div>
      </footer>
    </div>
  );
};

export default Home;
