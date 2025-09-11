// routes/inspections.js
const express = require("express");
const router = express.Router();
const Inspection = require("../models/Inspection");
const Product = require("../models/Product");
const { updateAiForProduct } = require("../workers/ai_worker");

// Create a new inspection
router.post("/", async (req, res) => {
  try {
    const { productId, inspector, results, recommendation, gpsLocation, photos } = req.body;

    // 1. Find the product
    const productDoc = await Product.findOne({ productId });
    if (!productDoc) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 2. Save inspection
    const inspection = new Inspection({
      inspectionId: `INSP_${Date.now()}`,
      productId,
      inspector,
      results,
      recommendation,
      gpsLocation,
      photos
    });
    await inspection.save();

    // 3. Update Product's lastInspection and condition
    await Product.findOneAndUpdate(
      { productId },
      {
        $set: {
          lastInspection: {
            recommendation,
            results,
            inspector,
            gpsLocation,
            date: new Date(),
            photos
          },
          currentStatus: recommendation === "Replace" ? "needs_replacement" : "installed",
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    // 4. Update AI insights
    await updateAiForProduct(productDoc);

    res.json({ message: "Inspection saved, product updated, AI insights refreshed", inspection });
  } catch (err) {
    console.error("Error in POST /inspections:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
