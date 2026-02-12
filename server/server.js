// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const farmerRoutes = require('./routes/farmer');
const customerRoutes = require('./routes/customer');
const livestockRoutes = require('./routes/livestock');
const productRoutes = require('./routes/products');
const milkProductionRoutes = require('./routes/milkProduction');
const staffRoutes = require('./routes/staff');
const reportRoutes = require('./routes/reports');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://livestock360.vercel.app',
  'https://livestock360-git-main-sujithks-projects.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(express.json({ limit: '50mb' })); // Limit JSON body size to 50mb

// Request timeout middleware (30 seconds for all routes)
app.use((req, res, next) => {
  // Set timeout for all requests
  const timeout = 60000; // 60 seconds

  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      console.log(`Request timeout for ${req.method} ${req.path}`);
      res.status(408).json({
        success: false,
        message: 'Request timeout. Please try again.'
      });
    }
  }, timeout);

  // Clear timeout when response is finished
  res.on('finish', () => {
    clearTimeout(timeoutId);
  });

  next();
});

// ===================== MONGODB =====================

// API Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/products', productRoutes);
app.use('/api/milk-production', milkProductionRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

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

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 4000;

    // Log environment status (safety check)
    console.log('Environment Check:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`- PORT: ${PORT}`);
    console.log(`- MONGODB_URI defined: ${!!process.env.MONGODB_URI}`);

    // Connect to MongoDB with retry logic
    const connectDB = async (retries = 5) => {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB connected successfully');
      } catch (err) {
        console.error(`❌ MongoDB connection error (Attempts left: ${retries}):`, err.message);
        if (retries > 0) {
          console.log('Retrying in 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          await connectDB(retries - 1);
        } else {
          console.error('❌ Failed to connect to MongoDB after multiple attempts.');
          // Do not exit process, let server run to serve health check and logs
        }
      }
    };

    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      // server.close(() => process.exit(1)); // Don't crash on unhandled rejection for now
    });

  } catch (err) {
    console.error('❌ Server startup error:', err);
  }
};

startServer();
