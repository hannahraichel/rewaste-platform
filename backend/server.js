const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
// Load environment configurations
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/exchange', exchangeRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send('ReWaste Backend API is up and running smoothly.');
});

// ==========================================
// CRITICAL: This is what keeps the server alive!
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server executing successfully on port ${PORT}`);
});