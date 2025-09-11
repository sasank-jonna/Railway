// db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('🔎 Connecting to MongoDB... (hiding credentials)');
    await mongoose.connect(uri, { /* use defaults for modern drivers */ });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error', err.message);
    throw err;
  }
}

module.exports = connectDB;
