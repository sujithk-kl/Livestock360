// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-green-600 mb-4">Livestock360</h1>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/login')}  // Changed from '/farmer/register' to '/login'
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
        >
          Farmer
        </button>
        
        <button
          onClick={() => navigate('/customer')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
        >
          Customer
        </button>
      </div>
    </div>
  );
};

export default Home;