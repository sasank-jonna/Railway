const express = require("express");
const router = express.Router();
const Manufacturer = require("../models/Manufacturer");
const Lot = require("../models/Lot");
const Product = require("../models/Product");
const QRCode = require("qrcode");
const { genProductId } = require("../utils/idQr");

// Create Manufacturer
router.post("/", async (req, res) => {
  try {
    const { manufacturerId, name, contact } = req.body;
    const manuf = await Manufacturer.create({ manufacturerId, name, contact });
    res.status(201).json(manuf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create Lot and Products
router.post("/lots", async (req, res) => {
  try {
    const { manufacturerId, productType, quantity = 10, warrantyMonths = 24 } =
      req.body;

    // Check manufacturer
    const manuf = await Manufacturer.findOne({ manufacturerId });
    if (!manuf) return res.status(400).json({ error: "Manufacturer not found" });

    // Generate unique lotId
    const lotId = `LOT_${new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")}_${manufacturerId}_${Math.floor(Math.random() * 10000)}`;

    // Create Lot document
    const lot = await Lot.create({
      lotId,
      manufacturerId,
      productType,
      quantity,
      manufactureDate: new Date(),
      warrantyMonths,
    });

    const productDocs = [];

    // Generate products
    for (let i = 0; i < quantity; i++) {
      const pid = genProductId(manufacturerId);

      // Generate QR for individual product
      const qrUrl = await QRCode.toDataURL(pid);

      productDocs.push({
        productId: pid,
        lotId,
        manufacturerId,
        productType,
        manufactureDate: new Date(),
        warrantyMonths,
        currentStatus: "manufactured",
        createdAt: new Date(),
        qrUrl, // store QR for each product
      });
    }

    // Insert all products at once
    await Product.insertMany(productDocs);

    // Save all product IDs in the lot document
    lot.packageIds = productDocs.map((p) => p.productId);

    // Generate QR for the package (lot)
    const lotQrData = {
      lotId,
      manufacturerId,
      productType,
      quantity,
      warrantyMonths,
      productIds: productDocs.map((p) => p.productId),
    };
    lot.packageQrUrl = await QRCode.toDataURL(JSON.stringify(lotQrData));
    await lot.save();

    res.json({
      lot,
      createdCount: productDocs.length,
      productIds: productDocs.map((p) => p.productId),
      productQrs: productDocs.map((p) => p.qrUrl),
      packageQr: lot.packageQrUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/:manufacturerId/lots', async (req, res) => {
  try {
    const { manufacturerId } = req.params;

    // Find all lots for this manufacturer
    const lots = await Lot.find({ manufacturerId }).lean();

    if (!lots || lots.length === 0) {
      return res.status(404).json({ error: 'No lots found for this manufacturer' });
    }

    const lotsWithDetails = await Promise.all(
      lots.map(async lot => {
        // ✅ Generate QR for the lot
        const lotQrData = `${req.protocol}://${req.get('host')}/api/products?lotId=${lot.lotId}`;
        const lotQrUrl = await QRCode.toDataURL(lotQrData);

        // ✅ Fetch products inside this lot
        const products = await Product.find({ lotId: lot.lotId }).lean();

        // ✅ Add QR for each product
        const productsWithQr = await Promise.all(
          products.map(async product => {
            const prodQrData = `${req.protocol}://${req.get('host')}/api/products/${product.productId}`;
            const prodQrUrl = await QRCode.toDataURL(prodQrData);

            return {
              ...product,
              qrUrl: prodQrUrl,   // Base64 QR image
              qrLink: prodQrData  // Optional clickable API link
            };
          })
        );

        return {
          ...lot,
          lotQrUrl,   // ✅ Lot QR image
          lotQrLink: lotQrData, // Optional clickable API link
          products: productsWithQr
        };
      })
    );

    return res.json({
      count: lotsWithDetails.length,
      lots: lotsWithDetails
    });
  } catch (err) {
    console.error('Error fetching lots by manufacturer', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;


