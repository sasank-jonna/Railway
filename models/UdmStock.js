// models/UdmStock.js
const mongoose = require('mongoose');

const UdmStockSchema = new mongoose.Schema({
  receiptId: { type: String, required: true, unique: true, index: true },
  depotId: { type: String, required: true, index: true },
  products: [{ type: String }], // store productId strings; could be ObjectId refs if you change schema
  receivedDate: { type: Date },
  inspector: { type: String },
 
  // models/UdmStock.js (snippet)
status: {
  type: String,
  enum: ['in_stock','out_of_stock','in_depot','reserved','dispatched','in_condition','failure'],
  default: 'in_depot'
},
updatedAt: { type: Date, default: Date.now },


  manifestFile: { type: String }, // optional link to manifest (s3://...)
  createdAt: { type: Date, default: Date.now }
});


// Guard against re-compiling model (avoids OverwriteModelError when nodemon reloads)
module.exports = mongoose.models.UdmStock || mongoose.model('UdmStock', UdmStockSchema);
