const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/testDB';
const POOL_SIZE = parseInt(process.env.DB_POOL_SIZE, 10) || 10;

const opts = {
  maxPoolSize: POOL_SIZE,
  serverSelectionTimeoutMS: 5000,
};

let connected = false;

async function connectWithRetry(retries = 2, backoff = 1000) {
  try {
    await mongoose.connect(MONGODB_URI, opts);
    connected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    if (retries > 0) {
      console.log(`Retrying MongoDB connection in ${backoff}ms (${retries} retries left)`);
      await new Promise(r => setTimeout(r, backoff));
      return connectWithRetry(retries - 1, backoff * 2);
    }
    throw err;
  }
}

process.on('SIGINT', async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected via SIGINT');
  } catch (e) {}
  process.exit(0);
});

module.exports = { connectWithRetry, mongoose };
