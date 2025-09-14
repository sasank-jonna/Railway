// routes/inspections.js
const express = require("express");
const router = express.Router();
const Inspection = require("../models/Inspection");
const Product = require("../models/Product");
const UdmStock = require("../models/UdmStock");
const TmsInstall = require("../models/TmsInstall");
const { updateAiForProduct } = require("../workers/ai_worker");

router.post("/", async (req, res) => {
  try {
    const { productId, inspector, results, recommendation, gpsLocation, photos, failure } = req.body;

    if (!productId) return res.status(400).json({ error: "productId is required" });

    // 1. Find the product
    const productDoc = await Product.findOne({ productId });
    if (!productDoc) return res.status(404).json({ error: "Product not found" });

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

    // 3. Determine product status
    const isFailure = failure === true || failure === 'true';
    const newStatus = isFailure ? "failure" : "in_condition";

    // 4. Update Product's lastInspection and currentStatus
    const lastInspectionObj = {
      inspectionId: inspection.inspectionId,
      recommendation,
      results,
      inspector,
      gpsLocation,
      date: inspection.date || new Date(),
      photos,
      failure: isFailure   // 👈 add failure here
    };

    const updatedProduct = await Product.findOneAndUpdate(
      { productId },
      {
        $set: {
          lastInspection: lastInspectionObj,
          currentStatus: newStatus,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    // 5. Update linked UDM/TMS records
    if (updatedProduct.udmRecordId) {
      await UdmStock.findByIdAndUpdate(
        updatedProduct.udmRecordId,
        { $set: { status: newStatus, updatedAt: new Date() } },
        { new: true }
      );
    }

    if (updatedProduct.tmsRecordId) {
      await TmsInstall.findByIdAndUpdate(
        updatedProduct.tmsRecordId,
        { $set: { status: newStatus, updatedAt: new Date() } },
        { new: true }
      );
    }

    // 6. Update AI insights
    await updateAiForProduct(updatedProduct);

    // 7. Send response with failure included in inspection
    const inspectionResponse = inspection.toObject();
    inspectionResponse.failure = isFailure; // 👈 add failure in inspection response

    return res.json({
      message: "Inspection saved, product + linked records updated, AI refreshed",
      inspection: inspectionResponse,
      product: updatedProduct
    });

  } catch (err) {
    console.error("Error in POST /inspections:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
