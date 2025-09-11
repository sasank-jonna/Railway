const express = require('express');
const router = express.Router();
const { ulid } = require('ulid');

const Product = require('../models/Product');
const UdmStock = require('../models/UdmStock');
const Event = require('../models/Event');

/**
 * POST /api/udm/receive
 * Body: { depotId, lotId?, productIds?, inspector, notes }
 * If lotId provided, all products from that lot are marked in_stock.
 */
router.post('/receive', async (req, res) => {
  try {
    const { depotId, lotId, productIds = [], inspector, notes } = req.body;

    // resolve productIds if lotId provided
    let ids = Array.isArray(productIds) ? productIds.slice() : [];
    if (lotId) {
      const prods = await Product.find({ lotId }, { productId: 1 }).lean();
      const fromLot = prods.map(p => p.productId);
      ids = Array.from(new Set(ids.concat(fromLot)));
    }

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: 'No productIds provided and no products found for lotId' });
    }

    const receiptId = 'REC_' + ulid();
    const udmDoc = new UdmStock({
      receiptId,
      depotId,
      products: ids,
      inspector,
      notes,
      status: 'in_stock'
    });
    await udmDoc.save();

    // Bulk update products to set in_stock + udmRecordId
    const bulkOps = ids.map(pid => ({
      updateOne: {
        filter: { productId: pid },
        update: {
          $set: { currentStatus: 'in_stock', udmRecordId: udmDoc._id, updatedAt: new Date() }
        }
      }
    }));

    const bulkResult = await Product.bulkWrite(bulkOps, { ordered: false });

    // insert per-product events (audit)
    const events = ids.map(pid => ({
      eventType: 'receive',
      productId: pid,
      userId: inspector || 'udm_system',
      timestamp: new Date(),
      payload: { receiptId, depotId, notes }
    }));
    await Event.insertMany(events);

    const modifiedCount = bulkResult.modifiedCount ?? bulkResult.nModified ?? (bulkResult.result && bulkResult.result.nModified) ?? 0;

    return res.json({
      ok: true,
      udm: udmDoc,
      updatedCount: modifiedCount,
      requestedProducts: ids
    });
  } catch (err) {
    console.error('UDM /receive error', err);
    return res.status(500).json({ error: err.message || 'server error' });
  }
});

module.exports = router;
