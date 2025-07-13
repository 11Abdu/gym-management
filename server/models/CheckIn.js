import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    index: true
  },
  memberName: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
checkInSchema.index({ memberId: 1, date: 1 });
checkInSchema.index({ date: -1 });
checkInSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate duration
checkInSchema.pre('save', function(next) {
  if (this.checkOutTime && this.checkInTime) {
    this.duration = Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60));
  }
  next();
});

export default mongoose.model('CheckIn', checkInSchema);