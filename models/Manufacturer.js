// models/Manufacturer.js
const mongoose = require('mongoose');

const ManufacturerSchema = new mongoose.Schema({
  manufacturerId: { type: String, required: true, unique: true, index: true },
  name: String,
  contact: {
    email: String,
    phone: String
  },
  publicKey: String,
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Manufacturer', ManufacturerSchema);
