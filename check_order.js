const mongoose = require('mongoose');
const path = require('path');
const Order = require(path.join(__dirname, 'server', 'models', 'Order'));
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function checkOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const order = await Order.findOne().sort({ createdAt: -1 });
    console.log(JSON.stringify(order, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
checkOrder();
