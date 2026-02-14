const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST, before any other imports
dotenv.config();

// const connectDB = require('./config/db'); // Removed missing import

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};


// Import Routes (after dotenv.config() so environment variables are available)
// Import Routes
// const authRoutes = require('./routes/authRoutes'); // Removed as auth is handled in farmer/customer routes
const farmerRoutes = require('./routes/farmer');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const staffRoutes = require('./routes/staff');
const customerRoutes = require('./routes/customer');
const notificationRoutes = require('./routes/notificationRoutes');
const milkProductionRoutes = require('./routes/milkProduction');
const livestockRoutes = require('./routes/livestock');
// const orderRoutes = require('./routes/orderRoutes'); // REMOVED DUPLICATE


const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now (adjust for production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Increase timeout for slow requests (e.g., render spin-up)
app.use((req, res, next) => {
  req.setTimeout(500000); // 500 seconds
  res.setTimeout(500000);
  next();
});

// Connect to Database
connectDB();

// API Routes
// app.use('/api/auth', authRoutes); // Removed
app.use('/api/farmers', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/milk-production', milkProductionRoutes);
app.use('/api/livestock', livestockRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Livestock360 API is running...');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
