const mongoose = require('mongoose');

const livestockSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  animalType: {
    type: String,
    required: [true, 'Please provide animal type'],
    trim: true
  },
  count: {
    type: Number,
    required: [true, 'Please provide animal count'],
    min: [0, 'Count cannot be negative']
  },
  healthNotes: {
    type: String,
    trim: true,
    default: ''
  },
  vaccinationNotes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Livestock', livestockSchema);
