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
      <div className="w-full max-w-6xl mx-auto flex justify-end px-4 md:px-12">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-end space-y-8">
          <div className="text-center md:text-right">
            <h1 className="text-6xl md:text-8xl font-bold text-green-900 mb-4 drop-shadow-sm font-serif">Livestock360</h1>
            <p className="text-2xl text-green-800 font-medium tracking-wide">Manage your farm with ease</p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <button
              onClick={() => navigate('/customer/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-xl transition duration-300 transform hover:scale-105 text-lg"
            >
              Customer
            </button>
            <button
              onClick={() => navigate('/farmer/login')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-xl transition duration-300 transform hover:scale-105 text-lg"
            >
              Farmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
