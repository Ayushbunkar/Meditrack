const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['taken', 'missed'], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Alert', alertSchema);
