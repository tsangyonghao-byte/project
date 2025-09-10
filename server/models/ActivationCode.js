const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const activationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()
  },
  membershipType: {
    type: String,
    required: true,
    enum: ['monthly', 'lifetime']
  },
  duration: {
    type: Number,
    required: true,
    default: 30 // days
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['unused', 'used', 'expired'],
    default: 'unused'
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Set expiration date
activationCodeSchema.pre('save', function(next) {
  if (!this.expiresAt && this.membershipType === 'monthly') {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + this.duration);
    this.expiresAt = expireDate;
  }
  next();
});

module.exports = mongoose.model('ActivationCode', activationCodeSchema);