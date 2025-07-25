const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
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
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    location: {
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    preferences: {
      units: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric'
      },
      notifications: {
        weather: { type: Boolean, default: true },
        carbon: { type: Boolean, default: true },
        alerts: { type: Boolean, default: true }
      }
    }
  },
  carbonFootprint: {
    daily: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    yearly: { type: Number, default: 0 },
    history: [{
      date: Date,
      value: Number,
      category: String
    }]
  },
  activityLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    data: mongoose.Schema.Types.Mixed
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

