const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day'],
    default: 'present'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const staffSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide staff name'],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    trim: true,
    default: ''
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative'],
    default: 0
  },
  attendance: {
    type: [attendanceSchema],
    default: []
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  wageType: {
    type: String,
    enum: ['daily', 'monthly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  paymentHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    period: String, // e.g., "January 2024"
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);
