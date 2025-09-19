const mongoose = require('mongoose');

const deviceDataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'devicedatas'
});

const DeviceData = mongoose.model('DeviceData', deviceDataSchema);

module.exports = DeviceData;
