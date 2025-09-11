// models/AiInsight.js
const mongoose = require('mongoose');

const AiInsightSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, index: true },
  lastComputedAt: Date,
  failureProbability: Number,
  nextInspectionDue: Date,
  action: String,
  explanations: [String],
  modelVersion: String,
  metadata: Object
});

module.exports = mongoose.model('AiInsight', AiInsightSchema);
