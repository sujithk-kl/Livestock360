// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FarmerRegistration from './pages/FarmerRegistration';
import FarmerLogin from './pages/FarmerLogin';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerLivestock from './pages/FarmerLivestock';
import FarmerProducts from './pages/FarmerProducts';
import FarmerMilkProduction from './pages/FarmerMilkProduction';
import FarmerStaff from './pages/FarmerStaff';
import FarmerReports from './pages/FarmerReports';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegistration from './pages/CustomerRegistration';

import CustomerProducts from './pages/CustomerProducts';
import ProductDetails from './pages/ProductDetails';


function App() {
  return (
    <Router>
      <div className="App">
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
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/register" element={<CustomerRegistration />} />

          <Route path="/customer/products" element={<CustomerProducts />} />
          <Route path="/customer/products/:category" element={<ProductDetails />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
