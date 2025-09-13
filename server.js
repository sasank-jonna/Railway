// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./db');


const app = express();
app.use(express.json({ limit: '10mb' }));

// connect DB
connectDB().catch(err => { process.exit(1); });

// routes
const manufacturerRoutes = require('./routes/manufacturer');
app.use('/api/manufacturer', manufacturerRoutes);



//app.use('/api/manufacturer', require('./routes/manufacturer'));
app.use('/api/udm', require('./routes/udm'));
app.use('/api/tms', require('./routes/tms'));
app.use('/api/events', require('./routes/events'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/products', require('./routes/products'));



app.get('/', (req,res)=> res.send('Railway QR Backend OK'));





const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`✅ Server started at http://localhost:${PORT}`));
