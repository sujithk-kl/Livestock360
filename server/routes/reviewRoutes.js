const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private (Customer)
router.post('/', protect, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;
        const userName = req.user.name || req.user.firstName || 'Customer';

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check for existing review
        const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'Product already reviewed' });
        }

        // Create review
        const review = await Review.create({
            user: userId,
            userName,
            product: productId,
            rating: Number(rating),
            comment
        });

        // Recalculate average rating
        const reviews = await Review.find({ product: productId });
        const numReviews = reviews.length;
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

        // Update product
        product.numReviews = numReviews;
        product.averageRating = avgRating;
        await product.save();

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error('Error adding review:', error);
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Product already reviewed' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
