// Load environment variables
require('dotenv').config();

// ===================== DEBUG ENV =====================
console.log('Environment variables loaded:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Loaded' : 'Not found',
  PORT: process.env.PORT || '4000 (default)',
  JWT_SECRET: process.env.JWT_SECRET ? 'Loaded' : 'Not found',
  NODE_ENV: process.env.NODE_ENV || 'development',
});
// ====================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit JSON body size to 10kb

// ===================== MONGODB =====================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
// ================================================

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Livestock360 API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages
    });
  }

  // Handle duplicate key errors (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Handle JWT expired error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error handler
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
