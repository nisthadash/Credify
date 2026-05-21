const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  tokenId: { 
    type: Number,
    required: false
  },
  walletAddress: { 
    type: String,
    lowercase: true,
    trim: true,
    required: false
  },
  verifiedAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: Boolean, 
    required: true 
  },
  ipAddress: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
