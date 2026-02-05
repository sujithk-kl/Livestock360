
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const runDebug = async () => {
    await connectDB();

    try {
        const cityToFind = 'Namakkal';
        console.log(`\n--- 1. Finding Farmers in '${cityToFind}' ---`);

        // Use exact regex from controller
        const farmersInCity = await Farmer.find({
            'address.city': { $regex: new RegExp(cityToFind.trim(), 'i') }
        });

        console.log(`Found ${farmersInCity.length} farmers.`);
        farmersInCity.forEach(f => {
            console.log(`- ID: ${f._id}, Name: ${f.name}, City: '${f.address.city}'`);
        });

        if (farmersInCity.length === 0) {
            console.log('No farmers found. Problem is likely city name mismatch or address structure.');

            console.log('\n--- 1b. Checking all farmers cities ---');
            const allFarmers = await Farmer.find({}, 'name address.city');
            allFarmers.forEach(f => {
                console.log(`- Name: ${f.name}, City: '${f.address?.city}'`);
            });
            process.exit();
        }

        const farmerIds = farmersInCity.map(f => f._id);

        console.log(`\n--- 2. Finding Products for Farmer IDs: ${farmerIds} ---`);

        const products = await Product.find({ farmer: { $in: farmerIds } });
        console.log(`Found ${products.length} products.`);
        products.forEach(p => {
            console.log(`- Product: ${p.productName}, Category: '${p.category}', Farmer: ${p.farmer}`);
        });

        console.log('\n--- 3. Checking Category Filter for "Curd" ---');
        const curdProducts = await Product.find({
            farmer: { $in: farmerIds },
            category: 'Curd'
        });
        console.log(`Found ${curdProducts.length} "Curd" products.`);
        curdProducts.forEach(p => {
            console.log(`- Product: ${p.productName}, Status: ${p.status}`);
        });


    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

runDebug();
