const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const TmsInstall = require("../models/TmsInstall");
const UdmStock = require('../models/UdmStock');

router.post("/install", async (req, res) => {
  try {
    const {
      productId,
      lotId,
      trackLocation,
      gpsLocation,
      installedBy,
      installDate,
      notes,
    } = req.body;

    if ((!productId && !lotId) || !trackLocation || !gpsLocation) {
      return res
        .status(400)
        .json({
          error: "productId/lotId, trackLocation and gpsLocation are required",
        });
    }

    // Create TMS record
    const tmsDoc = await TmsInstall.create({
      installId: `INS_${Date.now()}`,
      productId,
      lotId,
      trackLocation,
      gpsLocation,
      installedBy,
      installedDate: installDate ? new Date(installDate) : new Date(),
      status: "installed",
      additionalNotes: notes,
    });

    // Update Product with installation info
    const product = await Product.findOneAndUpdate(
      productId ? { productId } : { lotId },
      {
        $set: {
          currentStatus: "installed",
          tmsRecordId: tmsDoc._id,
          updatedAt: new Date(),
          installation: {
            location: trackLocation,
            coordinates: gpsLocation,
            installerName: installedBy,
            date: installDate ? new Date(installDate) : new Date(),
            notes,
          },
        },
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.udmRecordId) {
      await UdmStock.findByIdAndUpdate(product.udmRecordId, {
        $set: { status: "installed", updatedAt: new Date() },
      });
    }

    return res.json({ tms: tmsDoc, product });
  } catch (err) {
    console.error("POST /api/tms/install error", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
