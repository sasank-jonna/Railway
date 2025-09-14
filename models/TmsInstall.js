const mongoose = require('mongoose');

const TmsInstallSchema = new mongoose.Schema({
  installId: { type: String, unique: true, index: true },
  productId: { type: String, index: true },
  lotId: { type: String, index: true },

  trackLocation: { type: String }, // e.g., TRACK_SEC_123 (from TMS system)
  
  gpsLocation: {
    lat: Number,
    lng: Number
  },

  installedBy: String,
 
  installedDate: { type: Date, default: Date.now },
 // models/TmsInstall.js (snippet)
status: {
  type: String,
  enum: ['installed','in_condition','failure','retired'],
  default: 'installed'
},
updatedAt: { type: Date, default: Date.now },

  additionalNotes: String
});

module.exports = mongoose.models.TmsInstall || mongoose.model('TmsInstall', TmsInstallSchema);
