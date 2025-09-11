// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

router.post('/scan', async (req,res)=>{
  try {
    const { productId, userId='user_demo', gps = {}, payload = {} } = req.body;
    const event = await Event.create({ eventType:'scan', productId, userId, timestamp: new Date(), gps, payload });
    res.json({ ok:true, eventId: event._id });
  } catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

module.exports = router;
