const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    membershipNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    shift: {
      type: String,
      enum: ['morning', 'evening'],
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
    },
    planStartDate: {
      type: Date,
    },
    planExpiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'frozen'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

memberSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Member', memberSchema);
