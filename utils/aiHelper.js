// utils/aiHelper.js
const Inspection = require('../models/Inspection');
const AiInsight = require('../models/AiInsight');

function computeSimpleAi(product, inspections = []) {
  // same logic as worker — copy/paste
}

async function updateAiForProduct(product) {
  const inspections = await Inspection.find({ productId: product.productId }).lean();
  const ai = computeSimpleAi(product, inspections);
  await AiInsight.updateOne({ productId: product.productId }, { $set: { productId: product.productId, ...ai } }, { upsert: true });
  return ai;
}

module.exports = { updateAiForProduct, computeSimpleAi };
