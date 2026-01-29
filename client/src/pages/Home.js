import React from 'react';
import { useNavigate } from 'react-router-dom';
import farmerImg from '../assets/Farmer.jpg';
import customerImg from '../assets/delivery.jpg';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBD4] flex flex-col items-center justify-center p-4">
      {/* Header Section */}
      <div className="text-center mb-16 relative">
        <h1 className="text-6xl md:text-8xl font-bold text-green-600 mb-2 font-serif relative z-10">Livestock360</h1>
        <p className="text-xl md:text-2xl text-black font-medium font-sans text-right mr-4">Manage Your Farm With Ease</p>
      </div>

      {/* Role Selection Cards */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-24 items-center justify-center w-full max-w-5xl">

        {/* Farmer Card */}
        <div
          onClick={() => navigate('/farmer/login')}
          className="cursor-pointer flex flex-col items-center transition-transform duration-300 hover:scale-105"
        >
          <div className="p-1 bg-white">
            <div className="w-56 h-auto border border-gray-200 overflow-hidden relative shadow-md">
              <img src={farmerImg} alt="Farmer" className="w-full h-auto" />
            </div>
          </div>
          <div className="mt-4 px-8 py-2 bg-purple-600 hover:bg-purple-700 transition-colors duration-300 rounded-full shadow-lg text-center">
            <span className="text-2xl font-medium text-white font-serif">Farmer</span>
          </div>
        </div>

        {/* Customer Card */}
        <div
          onClick={() => navigate('/customer/login')}
          className="cursor-pointer flex flex-col items-center transition-transform duration-300 hover:scale-105"
        >
          <div className="p-1 bg-white">
            <div className="w-56 h-auto bg-gray-100 border border-gray-200 overflow-hidden relative shadow-md">
              <img src={customerImg} alt="Customer" className="w-full h-auto" />
            </div>
          </div>
          <div className="mt-4 px-8 py-2 bg-green-600 hover:bg-green-700 transition-colors duration-300 rounded-full shadow-lg text-center">
            <span className="text-2xl font-medium text-white font-serif">Customer</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
