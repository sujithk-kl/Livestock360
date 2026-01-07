// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FarmerRegistration from './pages/FarmerRegistration';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegistration from './pages/CustomerRegistration';
import CustomerDashboard from './pages/CustomerDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/farmer/register" element={<FarmerRegistration />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/register" element={<CustomerRegistration />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
