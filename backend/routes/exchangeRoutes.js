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

module.exports = router;