const mongoose = require('mongoose');

const milkProductionSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  animalType: {
    type: String,
    required: [true, 'Please provide animal type'],
    trim: true,
    enum: ['Cow', 'Buffalo', 'Goat', 'Other']
  },
  date: {
    type: Date,
    required: [true, 'Please provide production date']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide milk quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  pricePerLitre: {
    type: Number,
    required: [true, 'Please provide price per litre'],
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index to ensure one record per animal type per day for a farmer
milkProductionSchema.index({ farmer: 1, date: 1, animalType: 1 }, { unique: true });

module.exports = mongoose.model('MilkProduction', milkProductionSchema);
