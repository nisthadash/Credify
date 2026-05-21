const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  organizerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  claimOpen: { 
    type: Boolean, 
    default: true 
  },
  tiers: { 
    type: [String], 
    default: ['pass', 'participant', 'finalist', 'winner', 'mentor'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
