const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  time: { type: String, required: true }, // e.g. "08:00"
  dosage: { type: String, required: true },
});

module.exports = mongoose.model('Medicine', medicineSchema);
