const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ==========================================
// 1. REGISTER INDUSTRIAL USER [cite: 11, 27, 28]
// ==========================================
router.post('/register', async (req, res) => {
    const { company_name, email, password, industry_type, district, state, raw_material_keywords } = req.body; // [cite: 11]
    
    try {
        // Check if industry already exists
        const userExists = await pool.query('SELECT * FROM industries WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "This email is already registered." });
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Save to PostgreSQL database (Defaults is_admin to false on registration)
        const newUser = await pool.query(
            `INSERT INTO industries (company_name, email, password_hash, industry_type, district, state, raw_material_keywords) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, company_name, email, industry_type, is_admin`,
            [company_name, email, password_hash, industry_type, district, state, raw_material_keywords || []] // [cite: 11]
        );

        // Generate a 24-hour JWT token
        const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ token, user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Registration failed on server." });
    }
});

// ==========================================
// 2. LOGIN INDUSTRIAL USER
// ==========================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if industry user exists
        const userResult = await pool.query('SELECT * FROM industries WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password credentials." });
        }

        const user = userResult.rows[0];

        // Compare encrypted password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password credentials." });
        }

        // NEW: Check if the account has been approved by the Admin
        if (!user.is_verified) {
            return res.status(403).json({ 
                error: "Your account is currently awaiting admin verification. Access to the hub will be unlocked shortly." 
            });
        }

        // Generate JWT token if both credentials match and user is verified
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Don't return password_hash to frontend
        delete user.password_hash;

        res.json({ token, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Login failed on server." });
    }
});

// ==========================================
// 3. GET PROFILE DATA (Protected Route) [cite: 11, 14, 28]
// ==========================================
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // FIXED: Added is_admin to the explicit column selection list
        const userResult = await pool.query(
            'SELECT id, company_name, email, industry_type, district, state, raw_material_keywords, is_admin, created_at FROM industries WHERE id = $1', 
            [req.user.id] // [cite: 11]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Industrial profile not found." });
        }

        res.json({ user: userResult.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to retrieve profile data." });
    }
});
// ==========================================
// 3. GET PROFILE DATA (Protected Route)
// ==========================================
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userResult = await pool.query(
            'SELECT id, company_name, email, industry_type, district, state, raw_material_keywords, is_admin, created_at FROM industries WHERE id = $1', 
            [req.user.id]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Industrial profile not found." });
        }

        // Return a clean, flat object instead of nesting it inside a 'user' key
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to retrieve profile data." });
    }
});
module.exports = router;