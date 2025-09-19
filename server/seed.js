const mongoose = require('mongoose');
require('dotenv').config();
const MeditrackLog = require('./models/meditrackLogSchema'); // fixed import

const dummyData = [
  {
    device_id: "device_001",
    event_type: "dose_event",
    compartment: 1,
    medicine_name: "Paracetamol 500mg",
    status: "Taken",
    notes: "Taken on time",
    system_state: "Idle",
    wifi_connected: true,
    session_name: "Morning Dose"
  },
  {
    device_id: "device_001",
    event_type: "dose_event",
    compartment: 2,
    medicine_name: "Vitamin D",
    status: "Late",
    notes: "User took dose 1 hour late",
    system_state: "Active",
    wifi_connected: true,
    session_name: "Afternoon Dose"
  },
  {
    device_id: "device_002",
    event_type: "heartbeat",
    system_state: "Monitoring",
    wifi_connected: true
  },
  {
    device_id: "device_003",
    event_type: "system_event",
    system_state: "Rebooted",
    wifi_connected: true,
    notes: "System restarted after firmware update"
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await MeditrackLog.insertMany(dummyData);
    console.log("✅ Dummy data inserted to MongoDB");
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
