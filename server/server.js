// server/index.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const medsRoutes = require('./routes/meds');
const alertRoutes = require('./routes/alertRoutes');

// Import DeviceData model
const { DeviceData } = require('./db');

const app = express();

// Trust proxy for deployments behind reverse proxies (Render/Railway)
if (process.env.NODE_ENV === "production") {
  app.set('trust proxy', 1);
}

// Use CORS with env variable for production, fallback to '*' for dev
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/meds', medsRoutes);
app.use('/api/alerts', alertRoutes);

// Endpoint for ESP32 to send data to MongoDB
app.post('/api/device/data', async (req, res) => {
  try {
    // Save req.body to MongoDB
    const saved = await DeviceData.create(req.body);
    res.json({ status: 'success', saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Health check route
app.get('/api/hello', (req, res) => {
  res.json({ msg: 'API working!' });
});

// Root API health
app.get('/', (req, res) => {
  res.send('MediTrack API is running');
});

// ---- MongoDB Setup ----
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const MAX_DB_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 1500;

function printMongoSafetyNotice() {
  if (mongoUri && /mongodb\+srv:\/\/.*:.*@/.test(mongoUri)) {
    console.log('ℹ️  Using MongoDB Atlas SRV connection string');
  }
}

async function connectWithRetry(attempt = 1) {
  if (!mongoUri) {
    console.error('❌ No MongoDB URI found. Set MONGODB_URI in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri);
    return;
  } catch (err) {
    if (attempt >= MAX_DB_RETRIES) {
      console.error(`❌ Failed to connect after ${attempt} attempts:`, err.message);
      process.exit(1);
    }
    const delay = INITIAL_RETRY_DELAY_MS * attempt;
    console.warn(`⚠️ MongoDB attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
    await new Promise(r => setTimeout(r, delay));
    return connectWithRetry(attempt + 1);
  }
}

// DB event listeners
mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));

// ---- Start server ----
const desiredPort = Number(process.env.PORT) || 5000;

async function start() {
  try {
    printMongoSafetyNotice();
    await connectWithRetry();

    let currentPort = desiredPort;
    let server;
    const maxAttempts = 15;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        await new Promise((resolve, reject) => {
          server = app
            .listen(currentPort, '0.0.0.0', () => {
              if (currentPort !== desiredPort) {
                console.warn(`⚠️ Falling back to port ${currentPort} (original ${desiredPort} busy)`);
              }
              console.log(`🚀 Server running at http://localhost:${currentPort}`);
              resolve();
            })
            .once('error', (err) => {
              if (err.code === 'EADDRINUSE') {
                console.warn(`Port ${currentPort} in use. Trying ${currentPort + 1}...`);
                currentPort++;
                setTimeout(() => reject(err), 50);
              } else {
                reject(err);
              }
            });
        });
        break;
      } catch (err) {
        if (err.code !== 'EADDRINUSE') throw err;
        if (attempt === maxAttempts) {
          throw new Error(`Unable to bind to a free port after ${maxAttempts} attempts`);
        }
      }
    }

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('🛑 Server and DB closed. Bye!');
          process.exit(0);
        });
      });
      setTimeout(() => {
        console.error('Force exit after timeout.');
        process.exit(1);
      }, 10000).unref();
    };
    ['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => shutdown(sig)));

    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
    });
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}

start();
