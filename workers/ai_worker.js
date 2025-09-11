// workers/ai_worker.js
async function updateAiForProduct(productDoc) {
  // For now, just log – later you can add AI logic here
  console.log("AI worker received product:", productDoc.productId);
  return true;
}

module.exports = { updateAiForProduct };
