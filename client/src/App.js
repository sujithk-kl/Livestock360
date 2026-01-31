// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import FarmerRegistration from './pages/FarmerRegistration';
import FarmerLogin from './pages/FarmerLogin';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerLivestock from './pages/FarmerLivestock';
import FarmerProducts from './pages/FarmerProducts';
import FarmerMilkProduction from './pages/FarmerMilkProduction';
import FarmerStaff from './pages/FarmerStaff';
import FarmerReports from './pages/FarmerReports';
import FarmerProfile from './pages/FarmerProfile';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegistration from './pages/CustomerRegistration';
import CustomerProfile from './pages/CustomerProfile';

import CustomerProducts from './pages/CustomerProducts';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';


import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function AppContent() {
  const location = useLocation();
  const showThemeToggle = location.pathname !== '/';

  return (
    <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {showThemeToggle && <ThemeToggle />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/farmer/login" element={<FarmerLogin />} />
        <Route path="/farmer/register" element={<FarmerRegistration />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/livestock" element={<FarmerLivestock />} />
        <Route path="/farmer/products" element={<FarmerProducts />} />
        <Route path="/farmer/milk-production" element={<FarmerMilkProduction />} />
        <Route path="/farmer/staff" element={<FarmerStaff />} />
        <Route path="/farmer/reports" element={<FarmerReports />} />
        <Route path="/farmer/profile" element={<FarmerProfile />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegistration />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />

        <Route path="/customer/products" element={<CustomerProducts />} />
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/customer/products/:category" element={<ProductDetails />} />

      </Routes>
    </div>
  );
}

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
