// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//   productId: { type: String, required: true, unique: true, index: true },
//   lotId: { type: String, index: true },
//   manufacturerId: { type: String, index: true },
//   productType: String,
//   manufactureDate: Date,
//   warrantyMonths: Number,
//   initialMetadata: Object,
//   currentStatus: {
//     type: String,
//     enum: ['manufactured','in_transit','in_stock','installed','retired','expired',"failure"],
//     default: 'manufactured'
//   },
//   udmRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'UdmStock' },
//   tmsRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'TmsInstall' },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// models/Product.js
const mongoose = require('mongoose');

const LastInspectionSchema = new mongoose.Schema({
  inspectionId: String,
  recommendation: String,
  results: Object,
  inspector: String,
  gpsLocation: {
    lat: Number,
    lng: Number
  },
  photos: [String],
  date: Date
}, { _id: false });

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
    enum: [
      'manufactured',
      'in_transit',
      'in_stock',
      'installed',
      'retired',
      'expired',
      'in_condition',  // new
      'failure'        // new
    ],
    default: 'manufactured'
  },
  udmRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'UdmStock' },
  tmsRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'TmsInstall' },
  lastInspection: LastInspectionSchema, // fast read of latest inspection
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
