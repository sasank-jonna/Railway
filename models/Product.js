const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, index: true },
  lotId: { type: String, index: true },
  manufacturerId: { type: String, index: true },
  productType: String,
  manufactureDate: Date,
  warrantyMonths: Number,
  initialMetadata: Object,
  currentStatus: {
    type: String,
    enum: ['manufactured','in_transit','in_stock','installed','retired','expired'],
    default: 'manufactured'
  },
  udmRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'UdmStock' },
  tmsRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'TmsInstall' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
