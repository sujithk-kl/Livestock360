const mongoose = require('mongoose');
const path = require('path');
const Review = require(path.resolve(__dirname, 'models/Review'));
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function checkReviews() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const reviews = await Review.find({});
        console.log(`Found ${reviews.length} reviews.`);
        reviews.forEach(r => {
            console.log(`- User: ${r.userName} | Product: ${r.product} | Rating: ${r.rating} | Comment: ${r.comment}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkReviews();
