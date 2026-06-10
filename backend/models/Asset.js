const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true         
  },
  category: {
    type: String,
    required: true,
    enum: ['Camera', 'Lighting', 'Audio', 'Costume', 'Stage Props', 'Recording', 'Event Infrastructure', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0             
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0            
  },
  status: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'User',                           
    required: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Asset', assetSchema);