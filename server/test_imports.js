
const modules = [
    './routes/authRoutes',
    './routes/farmerRoutes',
    './routes/productRoutes',
    './routes/orderRoutes',
    './routes/reviewRoutes',
    './routes/adminRoutes',
    './routes/customerRoutes',
    './routes/notificationRoutes'
];

modules.forEach(m => {
    try {
        require(m);
        console.log(`${m} loaded successfully`);
    } catch (e) {
        console.log(`Error loading ${m}:`, e.message);
    }
});
