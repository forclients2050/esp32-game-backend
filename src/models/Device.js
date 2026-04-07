const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a device name'],
      trim: true,
    },
    macAddress: {
      type: String,
      required: [true, 'Please provide a MAC address'],
      unique: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'error'],
      default: 'disconnected',
    },
    lastConnectionTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', deviceSchema);
