const mongoose = require('mongoose');
require('dotenv').config();

const meditrackLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, required: true, index: true },
  device_id: { type: String, required: true, index: true },
  event_type: { 
    type: String, 
    required: true, 
    enum: ['dose_event', 'system_event', 'heartbeat'],
    index: true 
  },

  compartment: Number,
  medicine_name: String,
  status: { type: String, enum: ['Taken', 'Late', 'Missed'] },
  notes: String,

  system_state: String,
  wifi_connected: Boolean,
  session_name: String,
}, {
  timestamps: true,
  collection: 'meditrack_logs'
});

meditrackLogSchema.index({ device_id: 1, timestamp: -1 });
meditrackLogSchema.index({ event_type: 1, status: 1 });

// Utility: send notification email for missed dose
async function sendMissedDoseNotification({ device_id, medicine_name, timestamp, user_email }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set in environment variables.');
    return;
  }
  if (!user_email) {
    console.error('❌ No user_email provided for missed dose notification.');
    return;
  }
  const transporter = require('nodemailer').createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"MediTrack" <${process.env.EMAIL_USER}>`,
    to: user_email,
    subject: 'Missed Medicine Alert',
    html: `
      <h2>Medicine Missed Notification</h2>
      <p><strong>Device:</strong> ${device_id}</p>
      <p><strong>Medicine:</strong> ${medicine_name}</p>
      <p><strong>Missed At:</strong> ${new Date(timestamp).toLocaleString()}</p>
      <p>Please take your medicine as soon as possible or contact your healthcare provider if you have any questions.</p>
      <br>
      <small>This is an automated message from MediTrack.</small>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    // No terminal log for successful email
  } catch (err) {
    console.error(`❌ Failed to send email to ${user_email}:`, err.message);
  }
}

// Static method to notify on missed doses
meditrackLogSchema.statics.notifyIfMissed = async function (log, user_email) {
  if (log.status === 'Missed' && user_email) {
    await sendMissedDoseNotification({
      device_id: log.device_id,
      medicine_name: log.medicine_name,
      timestamp: log.timestamp,
      user_email
    });
  }
};

const MeditrackLog = mongoose.model('MeditrackLog', meditrackLogSchema);
module.exports = MeditrackLog;
  (async () => {
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
    if (!testEmail) {
      console.error('❌ TEST_EMAIL or EMAIL_USER not set in environment variables. Cannot send test email.');
      process.exit(1);
    }
    try {
      await sendMissedDoseNotification({
        device_id: 'test_device',
        medicine_name: 'Test Medicine',
        timestamp: new Date(),
        user_email: testEmail
      });
      console.log('✅ Test email sent to:', testEmail);
    } catch (err) {
      console.error('❌ Failed to send test email:', err.message);
    }
  })();
 
