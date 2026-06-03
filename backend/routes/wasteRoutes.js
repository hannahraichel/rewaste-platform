const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth'); // Protects this route

const router = express.Router();

// ==========================================
// 1. UPLOAD NEW WASTE LISTING (Protected)
// ==========================================
router.post('/upload', authMiddleware, async (req, res) => {
    const { title, material_type, quantity, unit, description, keywords } = req.body;

    try {
        // req.user.id is automatically populated by our authMiddleware token check
        const generator_id = req.user.id;

        const newListing = await pool.query(
            `INSERT INTO waste_listings (generator_id, title, material_type, quantity, unit, description, keywords)
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [generator_id, title, material_type, quantity, unit, description, keywords || []]
        );

        res.status(201).json({
            message: "Industrial waste resource listed successfully.",
            listing: newListing.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to publish waste listing on server." });
    }
});

// ==========================================
// 2. GET ALL AVAILABLE WASTE LISTINGS (Public/Searchable)
// ==========================================
router.get('/all', async (req, res) => {
    try {
        // Fetch listings and join with industry details to show location info
        const listings = await pool.query(
            `SELECT wl.*, i.company_name, i.district, i.state, i.industry_type 
             FROM waste_listings wl
             JOIN industries i ON wl.generator_id = i.id
             WHERE wl.is_available = TRUE
             ORDER BY wl.created_at DESC`
        );

        res.json(listings.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to retrieve waste repository." });
    }
});

module.exports = router;