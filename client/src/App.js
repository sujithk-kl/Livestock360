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
import CustomerCheckout from './pages/CustomerCheckout';
import CustomerOrders from './pages/CustomerOrders';
import ProductDetails from './pages/ProductDetails';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import LanguageSwitcher from './components/LanguageSwitcher';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const location = useLocation();
  const showThemeToggle = location.pathname !== '/';

  console.log('DEBUG: VITE_API_BASE_URL is:', import.meta.env.VITE_API_BASE_URL);

  return (
    <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <LanguageSwitcher />
      {showThemeToggle && <ThemeToggle />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Farmer Public Routes */}
        <Route path="/farmer/login" element={<FarmerLogin />} />
        <Route path="/farmer/register" element={<FarmerRegistration />} />

        {/* Customer Public Routes */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegistration />} />



        {/* Farmer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/livestock" element={<FarmerLivestock />} />
          <Route path="/farmer/products" element={<FarmerProducts />} />
          <Route path="/farmer/milk-production" element={<FarmerMilkProduction />} />
          <Route path="/farmer/staff" element={<FarmerStaff />} />
          <Route path="/farmer/reports" element={<FarmerReports />} />
          <Route path="/farmer/profile" element={<FarmerProfile />} />
        </Route>

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/products" element={<CustomerProducts />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/checkout" element={<CustomerCheckout />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/products/:category" element={<ProductDetails />} />
        </Route>

      </Routes>
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
