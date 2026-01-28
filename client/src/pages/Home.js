// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import homeBackground from '../assets/home_background.png';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center p-4 transition-colors duration-200"
      style={{
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: 'contain',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#F8C701'
      }}
    >
      <div className="w-full max-w-6xl mx-auto flex justify-end px-12 md:px-25 pb-32">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-end space-y-12">
          <div className="text-center md:text-right">
            <h1 className="text-5xl md:text-7xl font-bold text-green-700 mb-3 drop-shadow-sm font-serif">Livestock360</h1>
            <p className="text-xl text-black-1000 font-medium tracking-wide font-sans">Manage your farm with ease</p>
          </div>

          <div className="w-full max-w-xs space-y-4">
            <button
              onClick={() => navigate('/customer/login')}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 text-lg font-sans"
            >
              Customer
            </button>
            <button
              onClick={() => navigate('/farmer/login')}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 text-lg font-sans"
            >
              Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
