const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  eventType: String, // 'scan'|'receive'|'install'|'inspection'
  productId: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
  gps: Object,
  payload: Object
});

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
