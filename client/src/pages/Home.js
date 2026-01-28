import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Header Section */}
      <div className="text-center mb-16 relative">
        <h1 className="text-6xl md:text-8xl font-bold text-green-600 mb-2 font-serif relative z-10">Livestock360</h1>
        <p className="text-xl md:text-2xl text-black font-medium font-sans text-right mr-4">Manage your farm with ease</p>
      </div>

      {/* Role Selection Cards */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-32 items-center justify-center w-full max-w-5xl">

        {/* Farmer Card */}
        <div
          onClick={() => navigate('/farmer/login')}
          className="group cursor-pointer flex flex-col items-center transition-transform duration-300 hover:scale-105"
        >
          <div className="border-2 border-purple-600 p-1 bg-white">
            <div className="w-72 h-72 bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden relative">
              {/* Placeholder for Farmer Image */}
              <span className="text-gray-400 font-sans text-lg">Farmer Illustration</span>
              {/* Use this when image is ready: <img src={farmerImg} alt="Farmer" className="object-cover w-full h-full" /> */}
            </div>
          </div>
          <div className="mt-0 w-full border-2 border-t-0 border-purple-600 bg-purple-600 py-3 text-center">
            <span className="text-3xl font-medium text-white font-serif">Farmer</span>
          </div>
        </div>

        {/* Customer Card */}
        <div
          onClick={() => navigate('/customer/login')}
          className="group cursor-pointer flex flex-col items-center transition-transform duration-300 hover:scale-105"
        >
          <div className="border-2 border-green-600 p-1 bg-white">
            <div className="w-72 h-72 bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden relative">
              {/* Placeholder for Customer Image */}
              <span className="text-gray-400 font-sans text-lg">Customer Illustration</span>
              {/* Use this when image is ready: <img src={customerImg} alt="Customer" className="object-cover w-full h-full" /> */}
            </div>
          </div>
          <div className="mt-0 w-full border-2 border-t-0 border-green-600 bg-green-600 py-3 text-center">
            <span className="text-3xl font-medium text-white font-serif">Customer</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
