const mongoose = require('mongoose');

const eligibilitySchema = new mongoose.Schema({
  walletAddress: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    required: true 
  },
  approved: { 
    type: Boolean, 
    default: true 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
}, { timestamps: true });

// Prevent duplicate whitelist entry for same wallet and event
eligibilitySchema.index({ walletAddress: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Eligibility', eligibilitySchema);
