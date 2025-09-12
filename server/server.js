require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const net = require('net');

const authRoutes = require('./routes/auth');
const medsRoutes = require('./routes/meds');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meds', medsRoutes);
app.use('/api/alerts', alertRoutes);

// --- Port / startup helpers -------------------------------------------------
const desiredPort = Number(process.env.PORT) || 5000;

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          // Try next port
            resolve(findAvailablePort(startPort + 1));
        } else {
          reject(err);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(startPort)).close();
      })
      .listen(startPort, '0.0.0.0');
  });
}

// --- MongoDB connection helpers -------------------------------------------
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI; // allow either name
const MAX_DB_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 1500;

function printMongoSafetyNotice() {
  if (mongoUri && /mongodb\+srv:\/\/.*:.*@/.test(mongoUri)) {
    console.log('ℹ️  Using MongoDB Atlas SRV connection string');
  }
}

async function connectWithRetry(attempt = 1) {
  if (!mongoUri) {
    console.error('❌ No MongoDB connection string found. Set MONGODB_URI (preferred) or MONGO_URI in your .env file.');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri); // Mongoose 7: no need for old options
    return;
  } catch (err) {
    if (attempt >= MAX_DB_RETRIES) {
      console.error(`❌ Failed to connect to MongoDB after ${attempt} attempts:`, err.message);
      process.exit(1);
    }
    const delay = INITIAL_RETRY_DELAY_MS * attempt;
    console.warn(`⚠️  MongoDB connection attempt ${attempt} failed: ${err.message}. Retrying in ${delay} ms...`);
    await new Promise(r => setTimeout(r, delay));
    return connectWithRetry(attempt + 1);
  }
}

// Connection event listeners (diagnostics)
mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));

async function start() {
  try {
    // Connect DB (with retry)
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
                console.warn(`⚠️  Falling back to port ${currentPort} (original ${desiredPort} busy)`);
              }
              console.log(`🚀 Server running on http://localhost:${currentPort}`);
              resolve();
            })
            .once('error', (err) => {
              if (err.code === 'EADDRINUSE') {
                console.warn(`Port ${currentPort} in use. Trying ${currentPort + 1}...`);
                currentPort++;
                // Give the event loop a tick before retry
                setTimeout(() => reject(err), 50);
              } else {
                reject(err);
              }
            });
        });
        // Success -> break loop
        break;
      } catch (err) {
        if (err.code !== 'EADDRINUSE') throw err;
        if (attempt === maxAttempts) {
          throw new Error(`Unable to bind to a free port after ${maxAttempts} attempts starting from ${desiredPort}`);
        }
      }
    }

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('🛑 Server and DB connections closed. Bye!');
          process.exit(0);
        });
      });
      // Failsafe exit after 10s
      setTimeout(() => {
        console.error('Force exiting after graceful shutdown timeout.');
        process.exit(1);
      }, 10000).unref();
    };
    ['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => shutdown(sig)));

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
}

start();
