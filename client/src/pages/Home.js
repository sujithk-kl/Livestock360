// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import homeBackground from '../assets/home_background.png';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${homeBackground})` }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative z-10 text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-md">Livestock360</h1>
        <p className="text-xl text-gray-200">Manage your farm with ease</p>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/farmer/login')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 backdrop-blur-sm bg-opacity-90"
        >
          Farmer
        </button>

        <button
          onClick={() => navigate('/customer/login')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 backdrop-blur-sm bg-opacity-90"
        >
          Customer
        </button>
      </div>
    </div>
  );
};

export default Home;
