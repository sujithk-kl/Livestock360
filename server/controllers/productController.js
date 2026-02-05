const Product = require('../models/Product');
const Farmer = require('../models/Farmer');

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Farmer)
exports.createProduct = async (req, res, next) => {
  try {
    // Add farmer to req.body
    req.body.farmer = req.user.id;

    const { productName, category, unit, price, qualityTag, quantity } = req.body;

    // Check if product already exists for this farmer with same attributes and price
    let product = await Product.findOne({
      farmer: req.user.id,
      productName: { $regex: new RegExp(`^${productName}$`, 'i') }, // Case-insensitive match for name
      category,
      unit,
      price,
      qualityTag
    });

    if (product) {
      // If product exists, update quantity
      product.quantity += Number(quantity);
      await product.save();

      return res.status(200).json({
        success: true,
        data: product,
        message: 'Product quantity updated successfully'
      });
    }

    // Create new product if not exists
    product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get products for logged-in farmer
// @route   GET /api/products/farmer
// @access  Private (Farmer)
exports.getFarmerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ farmer: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all products (Public/Customer view)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'city'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    if (req.query.city) {
      // Find farmers in the city
      const farmersDocs = await Farmer.find({
        'address.city': { $regex: new RegExp(req.query.city.trim(), 'i') }
      }).select('_id');

      const farmersInCity = farmersDocs.map(f => f._id);

      // Add to query
      const queryObj = JSON.parse(queryStr);
      queryObj.farmer = { $in: farmersInCity };
      query = Product.find(queryObj);
    } else {
      query = Product.find(JSON.parse(queryStr));
    }

    // Populate farmer name if needed for the card
    query = query.populate('farmer', 'name address farmName');

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Executing query
    const products = await query;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'name address farmName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Farmer)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    // Make sure user is product owner
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this product`
      });
    }

    // Recalculate totalValue if price or quantity changes
    if (req.body.price || req.body.quantity) {
      const quantity = req.body.quantity !== undefined ? req.body.quantity : product.quantity;
      const price = req.body.price !== undefined ? req.body.price : product.price;
      req.body.totalValue = quantity * price;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Farmer)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    // Make sure user is product owner
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this product`
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
