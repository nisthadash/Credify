const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: false
  },
  walletAddress: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true
  },
  role: { 
    type: String, 
    enum: ['organizer', 'mentor', 'participant'], 
    default: 'organizer' 
  },
  apiKeys: [{
    key: { type: String, required: true },
    name: { type: String, default: 'Default API Key' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
