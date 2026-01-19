const mongoose = require('mongoose');

const milkProductionSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
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
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

milkProductionSchema.index({ farmer: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MilkProduction', milkProductionSchema);
