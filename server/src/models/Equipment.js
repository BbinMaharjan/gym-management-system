const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
    },
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['available', 'in-use', 'maintenance', 'retired'],
      default: 'available',
    },
    lastServicedDate: {
      type: Date,
    },
    nextServiceDue: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
