// routes/products.js
const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const UdmStock = require("../models/UdmStock");
const TmsInstall = require("../models/TmsInstall");
const Inspection = require("../models/Inspection");
// If you add AI insights later:
// const AiInsights = require('../models/AiInsights');

/**
 * GET /api/products/:productId
 * Returns product info + UDM depot record + TMS install record + inspections
 */
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Product
    const product = await Product.findOne({ productId }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 2. UDM stock
    const udm = product.udmRecordId
      ? await UdmStock.findById(product.udmRecordId).lean()
      : null;

    // 3. TMS installation
    const tms = product.tmsRecordId
      ? await TmsInstall.findById(product.tmsRecordId).lean()
      : await TmsInstall.findOne({ productId }).lean();

    // 4. Inspection history
    const inspections = await Inspection.find({ productId })
      .sort({ date: -1 })
      .lean();

    // 5. (Optional) AI insights
    // const ai = await AiInsights.findOne({ productId }).lean();

    return res.json({
      product,
      udm,
      tms,
      inspections,
      // ai
    });
  } catch (err) {
    console.error("GET /api/products/:productId error", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

/**
 * GET /api/products?lotId=...&productId=...
 * Returns multiple products filtered by lotId or productId
 */
/**
 * GET /api/products
 * Filters: lotId, productId, status, manufacturerId
 * If no filters provided, returns ALL products
 */

// ✅ Get all products with optional filters + UDM & TMS details
router.get("/", async (req, res) => {
  try {
    const { lotId, productId, status, manufacturerId } = req.query;

    let filter = {};
    if (lotId) filter.lotId = lotId;
    if (productId) filter.productId = productId;
    if (status) filter.currentStatus = status;
    if (manufacturerId) filter.manufacturerId = manufacturerId;

    // ✅ Fetch products with UDM + TMS populated
    const products = await Product.find(filter)
      .populate("udmRecordId")
      .populate("tmsRecordId")
      .lean();

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found for given filter(s)" });
    }

    // ✅ Attach latest inspection for each product
    const productsWithInspection = await Promise.all(
      products.map(async (p) => {
        const latestInspection = await Inspection.findOne({
          productId: p.productId,
        })
          .sort({ date: -1 }) // latest by date
          .lean();

        return {
          ...p,
          latestInspection: latestInspection || null,
        };
      })
    );

    return res.json({
      count: productsWithInspection.length,
      products: productsWithInspection,
    });
  } catch (err) {
    console.error("Error fetching products", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;
