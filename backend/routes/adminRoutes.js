const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper middleware to verify if the user has an admin flag
const adminCheck = async (req, res, next) => {
    try {
        const userRes = await pool.query('SELECT is_admin FROM industries WHERE id = $1', [req.user.id]);
        if (userRes.rows.length === 0 || !userRes.rows[0].is_admin) {
            return res.status(403).json({ error: "Access denied. Administrative authorization required." });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: "Admin verification routing error." });
    }
};

// ==========================================================
// GET MASTER PLATFORM OVERVIEW (METRICS, USERS, LISTINGS)
// ==========================================================
router.get('/dashboard', authMiddleware, adminCheck, async (req, res) => {
    try {
        // 1. Get all registered industries
        const industriesRes = await pool.query('SELECT id, company_name, industry_type, district, is_admin FROM industries ORDER BY company_name ASC');
        
        // 2. Get all global listings
        const listingsRes = await pool.query(
            `SELECT wl.*, i.company_name FROM waste_listings wl 
             JOIN industries i ON wl.generator_id = i.id 
             ORDER BY wl.created_at DESC`
        );

        // 3. Calculate platform-wide aggregate SDG impact
        const globalMetrics = await pool.query(
            `SELECT wl.quantity, wl.material_type 
             FROM exchange_requests er
             JOIN waste_listings wl ON er.listing_id = wl.id
             WHERE er.status = 'approved'`
        );

        let globalTons = 0;
        let globalCO2 = 0;

        globalMetrics.rows.forEach(row => {
            let weight = parseFloat(row.quantity);
            globalTons += weight;
            if (row.material_type === 'Wood Mills' || row.material_type === 'Wood & Timber Waste') globalCO2 += weight * 450;
            else if (row.material_type === 'Agro-Processing') globalCO2 += weight * 600;
            else if (row.material_type === 'Textiles') globalCO2 += weight * 800;
            else globalCO2 += weight * 300;
        });

        res.json({
            industries: industriesRes.rows,
            listings: listingsRes.rows,
            summary: {
                total_industries: industriesRes.rows.length,
                total_listings: listingsRes.rows.length,
                global_tons_diverted: Math.round(globalTons * 100) / 100,
                global_co2_saved_kg: Math.round(globalCO2)
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to gather administrative overview data." });
    }
});

// ==========================================================
// ADMIN ACTION: DELETE/MODERATE AN OFFENSIVE LISTING
// ==========================================================
router.delete('/listing/:id', authMiddleware, adminCheck, async (req, res) => {
    try {
        await pool.query('DELETE FROM waste_listings WHERE id = $1', [req.params.id]);
        res.json({ message: "Listing successfully moderated and removed by Admin." });
    } catch (err) {
        res.status(500).json({ error: "Failed to execute administrative deletion." });
    }
});

module.exports = router;