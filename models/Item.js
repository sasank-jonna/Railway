const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
  productId: { type: String, unique: true, required: true },
  lotId: String,
  manufacturerId: String,
  productType: String,
  manufactureDate: Date,
  warrantyMonths: Number,
  initialMetadata: mongoose.Schema.Types.Mixed,
  currentStatus: { type: String, default: 'manufactured' }, // manufactured, in_stock, installed, defective, retired
  udmRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'UdmStock' },
  tmsRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'TmsInstall' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});
module.exports = mongoose.model('Item', ItemSchema);
