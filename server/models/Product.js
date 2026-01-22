const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Milk',
      'Curd',
      'Butter',
      'Ghee',
      'Eggs',
      'Chicken',
      'Meat',
      'Other Farm Products'
    ]
  },
  unit: {
    type: String,
    required: [true, 'Please select a unit'],
    enum: ['Litre', 'Kg', 'Dozen', 'Piece']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Please add price'],
    min: [0, 'Price cannot be negative']
  },
  totalValue: {
    type: Number,
    // This will be calculated before save if not provided, but frontend usually sends it or backend calculates it.
    // For simplicity as requested: "Read-only" (calculated)
  },
  qualityTag: {
    type: String,
    enum: ['Fresh', 'Organic', 'Home-made'],
    default: 'Fresh'
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Out of Stock'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate totalValue before saving
// Calculate totalValue before saving
productSchema.pre('save', function () {
  this.totalValue = this.quantity * this.price;
});

module.exports = mongoose.model('Product', productSchema);
