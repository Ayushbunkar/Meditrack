// server/db.js

const mongoose = require('mongoose');

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

module.exports = connectDB;