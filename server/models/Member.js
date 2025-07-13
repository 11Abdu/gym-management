import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  relationship: {
    type: String,
    default: ''
  }
});

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  membershipDuration: {
    type: Number,
    required: true,
    min: 1
  },
  membershipPlan: {
    type: String,
    default: ''
  },
  membershipPrice: {
    type: Number,
    default: 0,
    min: 0
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
    enum: ['active', 'expired', 'suspended'],
    default: 'active'
  },
  qrCode: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastCheckIn: {
    type: Date
  },
  photo: {
    type: String, // Base64 encoded image
    default: ''
  },
  emergencyContact: {
    type: emergencyContactSchema,
    default: () => ({})
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
memberSchema.index({ firstName: 1, lastName: 1 });
memberSchema.index({ status: 1 });
memberSchema.index({ endDate: 1 });
memberSchema.index({ createdAt: -1 });

// Virtual for full name
memberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to generate member ID if not provided
memberSchema.pre('save', function(next) {
  if (!this.memberId) {
    const timestamp = Date.now().toString().slice(-6);
    this.memberId = `GYM${timestamp}`;
  }
  next();
});

export default mongoose.model('Member', memberSchema);