const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  tokenId: { 
    type: Number, 
    required: true,
    unique: true
  },
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
  tier: { 
    type: String, 
    required: true,
    default: 'pass'
  },
  metadataUri: { 
    type: String, 
    required: true 
  },
  txHash: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['minting', 'minted', 'upgraded', 'revoked'],
    default: 'minted' 
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Credential', credentialSchema);
