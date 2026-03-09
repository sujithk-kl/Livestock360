require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    console.log("Tomorrow object:", tomorrow, tomorrow.toISOString());

    const pendingOrders = await Order.find({
        deliveryStatus: 'Pending',
        deliveryDate: { $gte: tomorrow },
        deliverySlot: { $in: ['Morning (6-9 AM)', 'Evening (5-7 PM)'] },
        'deliveryAddress.pincode': { $exists: true, $ne: '' }
    });
    console.log("Found:", pendingOrders.length);
    process.exit(0);
});
