const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema({
  inspectionId: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true, index: true },
  
  inspector: String,
  date: { type: Date, default: Date.now },

  results: Object,  // flexible JSON results e.g., { voltage: 220, vibration: "normal" }
  recommendation: String, // "OK", "Repair", "Replace"

  gpsLocation: {
    lat: Number,
    lng: Number
  },

  photos: [String], // array of URLs

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inspection', InspectionSchema);
