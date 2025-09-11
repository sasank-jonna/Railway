// models/Lot.js
const mongoose = require('mongoose');

const LotSchema = new mongoose.Schema({
  lotId: { type: String, required: true, unique: true, index: true },
  manufacturerId: { type: String, required: true, index: true },
  productType: String,
  quantity: Number,
  manufactureDate: Date,
  warrantyMonths: Number,
  serialStart: Number,
  serialEnd: Number,
  packageIds: [String],
  manifestHash: String,
  signature: String,
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Lot || mongoose.model('Lot', LotSchema);

