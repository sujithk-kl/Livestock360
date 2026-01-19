const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative']
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Please provide available quantity'],
    min: [0, 'Available quantity cannot be negative']
  },
  unit: {
    type: String,
    trim: true,
    default: 'unit'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Sold quantity cannot be negative']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
