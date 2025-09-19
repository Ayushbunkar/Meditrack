const mongoose = require('mongoose');

const meditrackLogSchema = new mongoose.Schema({
  // Essential fields only
  timestamp: { 
    type: Date, 
    default: Date.now,
    required: true,
    index: true
  },
  device_id: { 
    type: String, 
    required: true,
    index: true
  },
  event_type: { 
    type: String, 
    required: true,
    enum: ['dose_event', 'system_event', 'heartbeat'],
    index: true
  },
  
  // Medication-specific fields (only for dose_event)
  compartment: Number,
  medicine_name: String,
  status: {
    type: String,
    enum: ['Taken', 'Late', 'Missed']
  },
  notes: String,
  
  // System state for context
  system_state: String,
  wifi_connected: Boolean,
  
  // Optional session info
  session_name: String, // "Morning Dose", "Evening Dose", etc.
  
}, {
  timestamps: true,
  collection: 'meditrack_logs'
});

// Only the indexes you'll actually use
meditrackLogSchema.index({ device_id: 1, timestamp: -1 });
meditrackLogSchema.index({ event_type: 1, status: 1 });

// Only one useful query method
meditrackLogSchema.statics.getRecentDoses = function(deviceId, hours = 24) {
  const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    device_id: deviceId,
    event_type: 'dose_event',
    timestamp: { $gte: cutoff }
  }).sort({ timestamp: -1 });
};

const MeditrackLog = mongoose.model('MeditrackLog', meditrackLogSchema);

// Ensure collection is created in MongoDB Atlas (optional, for debugging)
MeditrackLog.createCollection().catch(() => { /* ignore if already exists */ });

module.exports = MeditrackLog;