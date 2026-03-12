const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const webpush = require('web-push');

// Load environment variables FIRST, before any other imports
dotenv.config();

// Configure web-push VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@livestock360.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Keep-alive mechanism: Ping server every 14 minutes to prevent sleeping
if (process.env.BACKEND_URL) {
  cron.schedule('*/14 * * * *', async () => {
    try {
      const https = require('https');
      const http = require('http');
      const url = process.env.BACKEND_URL;
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, (res) => {
        console.log(`Keep-alive ping successful: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error('Keep-alive ping failed:', err.message);
      });
    } catch (error) {
      console.error('Keep-alive error:', error.message);
    }
  });
  console.log('Keep-alive cron job initialized - running every 14 minutes');
}

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
const contactRoutes = require('./routes/contact');
const reportRoutes = require('./routes/reports');
const subscriptionRoutes = require('./routes/subscriptions');
const walletRoutes = require('./routes/wallet');
const clusterRoutes = require('./routes/clusterRoutes');
const pushRoutes = require('./routes/pushRoutes');
const { runNightlyBilling } = require('./jobs/billingJob');
const { initClusteringJob } = require('./jobs/clusteringJob');


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

// ⏰ Nightly billing cron — runs every night at 11:59 PM
// Deducts daily subscription cost from each active customer's wallet
cron.schedule('59 23 * * *', () => {
  console.log('[Cron] Triggering nightly billing job...');
  runNightlyBilling();
}, {
  timezone: 'Asia/Kolkata'
});
console.log('[Cron] Nightly billing job scheduled for 23:59 IST every night.');

// Cluster delivery grouping job — runs at 10:00 PM IST every night
initClusteringJob();



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
app.use('/api/contact', contactRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/push', pushRoutes);

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

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
