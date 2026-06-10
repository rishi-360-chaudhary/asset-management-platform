const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1             
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'issued', 'returned'],
    default: 'pending'   
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  issuedAt: {
    type: Date
  },
  returnedAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Booking', bookingSchema);