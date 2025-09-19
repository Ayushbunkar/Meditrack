// server/db.js

const mongoose = require('mongoose');
const path = require('path');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const MAX_DB_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 1500;

async function connectDB(attempt = 1) {
  if (!mongoUri) {
    console.error('❌ No MongoDB URI found. Set MONGODB_URI in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    if (attempt >= MAX_DB_RETRIES) {
      console.error(`❌ Failed to connect to MongoDB after ${attempt} attempts:`, err.message);
      process.exit(1);
    }
    const delay = INITIAL_RETRY_DELAY_MS * attempt;
    console.warn(`⚠️ MongoDB connection attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
    await new Promise(r => setTimeout(r, delay));
    return connectDB(attempt + 1);
  }
}

// Optional: handle connection events for production monitoring
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));

// Import dotenv to load environment variables if not already loaded
require('dotenv').config();

// Import models
const MeditrackLog = require(path.join(__dirname, 'models', 'meditrackLogSchema'));
const DeviceData = require(path.join(__dirname, 'models', 'deviceDataSchema')); // Now this file exists

module.exports = {
  connectDB,
  DeviceData,
  MeditrackLog
};

// Test dummy entry if run directly (node db.js)
if (require.main === module) {
  (async () => {
    await connectDB();
    try {
      await DeviceData.create({
        temperature: 25.5,
        humidity: 60,
        timestamp: new Date()
      });
      // Removed terminal log for successful dummy save
    } catch (err) {
      console.error('❌ Error saving dummy DeviceData:', err.message);
    } finally {
      mongoose.disconnect();
    }
  })();
}