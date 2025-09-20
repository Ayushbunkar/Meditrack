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

// Import DeviceData and MeditrackLog models
const { DeviceData, MeditrackLog } = require('./db');

const app = express();

// Trust proxy for deployments behind reverse proxies (Render/Railway)
if (process.env.NODE_ENV === "production") {
  app.set('trust proxy', 1);
}

// CORS: allow prod + localhost; handle preflight + credentials
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://meditrack-pi.vercel.app,http://localhost:5173')
  .split(',')
  .map(s => s.trim());

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser or same-origin
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ensure preflight responds

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/meds', medsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/auth', authRoutes); // Support for /auth/register endpoint

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

// Example endpoint to log a dose event (ensure user_email is provided)
app.post('/api/meds/log', async (req, res) => {
  try {
    // You may want to fetch user_email from your user DB based on device_id or user session
    const user_email = req.body.user_email; // Or fetch from user DB/session
    const log = await MeditrackLog.create(req.body);
    // Notify if missed (pass user_email)
    await MeditrackLog.notifyIfMissed(log, user_email);
    res.json({ status: 'success', log });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log event' });
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

    // Graceful shutdown (no callback to mongoose.connection.close)
    function closeServer(serverInstance) {
      return new Promise((resolve, reject) => {
        serverInstance.close(err => (err ? reject(err) : resolve()));
      });
    }

    async function gracefulShutdown(signal) {
      console.log(`${signal} received. Shutting down gracefully...`);
      try {
        await closeServer(server);
        await mongoose.connection.close(); // no callback allowed in Mongoose 7+
        console.log('✅ HTTP server closed and MongoDB disconnected');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during shutdown', err);
        process.exit(1);
      }
    }

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Optional: catch unhandled rejections so process doesn't crash silently
    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}

start();
