// // routes/inspections.js
// const express = require("express");
// const router = express.Router();
// const Inspection = require("../models/Inspection");
// const Product = require("../models/Product");
// const { updateAiForProduct } = require("../workers/ai_worker");

// // Create a new inspection
// router.post("/", async (req, res) => {
//   try {
//     const { productId, inspector, results, recommendation, gpsLocation, photos } = req.body;

//     // 1. Find the product
//     const productDoc = await Product.findOne({ productId });
//     if (!productDoc) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     // 2. Save inspection
//     const inspection = new Inspection({
//       inspectionId: `INSP_${Date.now()}`,
//       productId,
//       inspector,
//       results,
//       recommendation,
//       gpsLocation,
//       photos
//     });
//     await inspection.save();

//     // 3. Update Product's lastInspection and condition
//     await Product.findOneAndUpdate(
//       { productId },
//       {
//         $set: {
//           lastInspection: {
//             recommendation,
//             results,
//             inspector,
//             gpsLocation,
//             date: new Date(),
//             photos
//           },
//           currentStatus: recommendation === "Replace" ? "needs_replacement" : "installed",
//           updatedAt: new Date()
//         }
//       },
//       { new: true }
//     );

//     // 4. Update AI insights
//     await updateAiForProduct(productDoc);

//     res.json({ message: "Inspection saved, product updated, AI insights refreshed", inspection });
//   } catch (err) {
//     console.error("Error in POST /inspections:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;

// routes/inspections.js
const express = require("express");
const router = express.Router();
const Inspection = require("../models/Inspection");
const Product = require("../models/Product");
const UdmStock = require("../models/UdmStock");
const TmsInstall = require("../models/TmsInstall");
const { updateAiForProduct } = require("../workers/ai_worker");

// Create a new inspection
router.post("/", async (req, res) => {
  try {
    // Accept `failure` boolean from frontend
    const { productId, inspector, results, recommendation, gpsLocation, photos, failure } = req.body;

    if (!productId) return res.status(400).json({ error: "productId is required" });

    // 1. Find the product
    const productDoc = await Product.findOne({ productId });
    if (!productDoc) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 2. Save inspection (AI recommendation still stored)
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

    // 3. Decide new product status based on frontend flag
    // If frontend sends `failure: true` -> 'failure', otherwise -> 'in_condition'
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
      photos
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
      { new: true } // return updated doc
    );

    // 5. Propagate to UDM / TMS if linked
    // (only update when linked — adjust logic if you want different behavior)
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

    // 6. Update AI insights (pass updated product)
    await updateAiForProduct(updatedProduct);

    return res.json({
      message: "Inspection saved, product + linked records updated, AI refreshed",
      inspection,
      product: updatedProduct
    });
  } catch (err) {
    console.error("Error in POST /inspections:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
