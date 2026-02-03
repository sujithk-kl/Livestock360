const mongoose = require('mongoose');
const path = require('path');
// Use relative path from CWD (d:\Livestock360)
const Order = require('./server/models/Order');
require('dotenv').config({ path: './server/.env' });

async function checkOrder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const order = await Order.findOne().sort({ createdAt: -1 });
        if (!order) {
            console.log("No orders found.");
        } else {
            console.log("Order ID:", order._id);
            console.log("Items:");
            order.items.forEach(item => {
                console.log(`- Product: ${item.productName}`);
                console.log(`  Category: '${item.category}'`);
                console.log(`  Farmer: ${item.farmerName}`);
            });
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkOrder();
