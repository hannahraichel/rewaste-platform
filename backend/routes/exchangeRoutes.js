const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ==========================================================
// 1. CREATE AN EXCHANGE REQUEST (Buyer Clicks "Request")
// ==========================================================
router.post('/request', authMiddleware, async (req, res) => {
    const { listing_id, message } = req.body;
    const buyer_id = req.user.id; // From JWT token

    try {
        // Safety Check: Verify the listing exists and isn't owned by the buyer
        const listingCheck = await pool.query(
            'SELECT generator_id, is_available FROM waste_listings WHERE id = $1',
            [listing_id]
        );

        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ error: "Waste listing not found." });
        }

        if (!listingCheck.rows[0].is_available) {
            return res.status(400).json({ error: "This waste material is no longer available." });
        }

        if (listingCheck.rows[0].generator_id === buyer_id) {
            return res.status(400).json({ error: "You cannot request your own waste listing." });
        }

        // Insert the request into the database
        const newRequest = await pool.query(
            `INSERT INTO exchange_requests (listing_id, buyer_id, message)
             VALUES ($1, $2, $3) RETURNING *`,
            [listing_id, buyer_id, message]
        );

        res.status(201).json({
            message: "Exchange request submitted successfully to the generator.",
            request: newRequest.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error creating exchange transaction." });
    }
});

// ==========================================================
// 2. GET INCOMING REQUESTS (For Sellers to view who wants their waste)
// ==========================================================
router.get('/incoming', authMiddleware, async (req, res) => {
    try {
        const seller_id = req.user.id;

        const incomingRequests = await pool.query(
            `SELECT er.*, wl.title as material_title, i.company_name as buyer_company, i.district, i.state
             FROM exchange_requests er
             JOIN waste_listings wl ON er.listing_id = wl.id
             JOIN industries i ON er.buyer_id = i.id
             WHERE wl.generator_id = $1
             ORDER BY er.created_at DESC`,
            [seller_id]
        );

        res.json(incomingRequests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch incoming exchange streams." });
    }
});

// ==========================================================
// 3. UPDATE REQUEST STATUS (Seller Approves or Rejects Request)
// ==========================================================
router.put('/status/:id', authMiddleware, async (req, res) => {
    const { status } = req.body; // Expects 'approved' or 'rejected' [cite: 36]
    const request_id = req.id || req.params.id;
    const seller_id = req.user.id;

    if (!['approved', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ error: "Invalid transactional status type." });
    }

    try {
        // Verify that the person updating this request actually owns the underlying waste listing
        const requestCheck = await pool.query(
            `SELECT er.*, wl.generator_id 
             FROM exchange_requests er
             JOIN waste_listings wl ON er.listing_id = wl.id
             WHERE er.id = $1`,
            [request_id]
        );

        if (requestCheck.rows.length === 0) {
            return res.status(404).json({ error: "Transaction record mismatch." });
        }

        if (requestCheck.rows[0].generator_id !== seller_id) {
            return res.status(401).json({ error: "Unauthorized operation on this listing." });
        }

        // Update the transaction status
        const updatedRequest = await pool.query(
            'UPDATE exchange_requests SET status = $1 WHERE id = $2 RETURNING *',
            [status, request_id]
        );

        // Optimization: If a seller approves a deal, automatically mark the main waste listing as unavailable
        if (status === 'approved') {
            await pool.query(
                'UPDATE waste_listings SET is_available = FALSE WHERE id = $1',
                [requestCheck.rows[0].listing_id]
            );
        }

        res.json({
            message: `Transaction has been successfully marked as ${status}.`,
            request: updatedRequest.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed updating exchange status values." });
    }
});
// ==========================================================
// GET FULL EXCHANGE HISTORY (Incoming & Outgoing)
// ==========================================================
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch requests where the user is either the buyer OR the seller
        const history = await pool.query(
            `SELECT er.*, wl.title as material_title, 
             seller.company_name as seller_name, 
             buyer.company_name as buyer_company
             FROM exchange_requests er
             JOIN waste_listings wl ON er.listing_id = wl.id
             JOIN industries seller ON wl.generator_id = seller.id
             JOIN industries buyer ON er.buyer_id = buyer.id
             WHERE wl.generator_id = $1 OR er.buyer_id = $1
             ORDER BY er.created_at DESC`,
            [userId]
        );

        res.json(history.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch exchange history." });
    }
});
// ==========================================================
// 4. POST LOGISTICS MESSAGE TO TRANSMISSION THREAD
// ==========================================================
router.post('/message/:id', authMiddleware, async (req, res) => {
    const request_id = req.params.id;
    const sender_id = req.user.id;
    const { message_text } = req.body;

    if (!message_text || message_text.trim() === '') {
        return res.status(400).json({ error: "Message field cannot be empty." });
    }

    try {
        // Verify user belongs to this transaction (either as buyer or listing generator)
        const checkTx = await pool.query(
            `SELECT er.*, wl.generator_id 
             FROM exchange_requests er
             JOIN waste_listings wl ON er.listing_id = wl.id
             WHERE er.id = $1`,
            [request_id]
        );

        if (checkTx.rows.length === 0) {
            return res.status(404).json({ error: "Transaction instance not found." });
        }

        const tx = checkTx.rows[0];
        if (tx.buyer_id !== sender_id && tx.generator_id !== sender_id) {
            return res.status(401).json({ error: "Unauthorized access to this communication thread." });
        }

        // Fetch sender's company name to attach to the text bubble
        const nameRes = await pool.query('SELECT company_name FROM industries WHERE id = $1', [sender_id]);
        const senderName = nameRes.rows[0].company_name;

        const newMsg = {
            sender_id,
            sender_name: senderName,
            text: message_text,
            timestamp: new Date().toISOString()
        };

        // Append message object into the PostgreSQL JSONB array log
        const updatedTx = await pool.query(
            `UPDATE exchange_requests 
             SET communications = communications || $1::jsonb 
             WHERE id = $2 RETURNING *`,
            [JSON.stringify(newMsg), request_id]
        );

        res.json({ success: true, communications: updatedTx.rows[0].communications });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to broadcast messaging updates." });
    }
});
// ==========================================================
// GET ECO-ANALYTICS METRICS FOR THE LOGGED-IN INDUSTRY
// ==========================================================
router.get('/analytics/sustainability', authMiddleware, async (req, res) => {
    const industry_id = req.user.id;

    try {
        // Query all approved transactions where this user was either the buyer or the seller
        const metricsQuery = await pool.query(
            `SELECT er.quantity, wl.material_type 
             FROM exchange_requests er
             JOIN waste_listings wl ON er.listing_id = wl.id
             WHERE er.status = 'approved' AND (er.buyer_id = $1 OR wl.generator_id = $1)`,
            [industry_id]
        );

        let totalTonsDiverted = 0;
        let carbonEmissionsSaved = 0; // Measured in kg of CO2

        metricsQuery.rows.forEach(row => {
            // Convert everything to tons uniformly for calculation safety
            let weightInTons = parseFloat(row.quantity);
            totalTonsDiverted += weightInTons;

            // Environmental Impact Coefficients (Mass multiplier based on standard EPA models)
            if (row.material_type === 'Wood Mills') {
                // Reusing wood scraps saves wood timber logging processing energy (~450kg CO2 per ton)
                carbonEmissionsSaved += weightInTons * 450;
            } else if (row.material_type === 'Agro-Processing') {
                // Preventing agricultural waste decomposition avoids methane generation equivalents (~600kg CO2 per ton)
                carbonEmissionsSaved += weightInTons * 600;
            } else if (row.material_type === 'Textiles') {
                // Textile processing is heavy on carbon; recycling saves ~800kg CO2 per ton
                carbonEmissionsSaved += weightInTons * 800;
            } else {
                carbonEmissionsSaved += weightInTons * 300;
            }
        });

        res.json({
            total_listings_closed: metricsQuery.rows.length,
            total_tons_diverted: Math.round(totalTonsDiverted * 100) / 100,
            co2_saved_kg: Math.round(carbonEmissionsSaved)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to compile environmental metric trackers." });
    }
});
module.exports = router;