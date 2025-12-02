// hms-backend/routes/auth.js
const express = require('express');
const router = express.Router();

// Staff Login (POST /api/auth/login)
router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: 'username and password are required.' 
        });
    }
    
    try {
        const sql = `SELECT * FROM authenticate_staff($1, $2)`;
        const result = await req.app.locals.db.query(sql, [username, password]);
        
        if (result.rows.length === 0 || !result.rows[0].success) {
            return res.status(401).json({ 
                error: 'Authentication failed', 
                details: 'invalid username or password.' 
            });
        }
        
        const staff = result.rows[0];
        res.status(200).json({
            staffId: staff.staff_id,
            userName: staff.user_name,
            role: staff.staff_role
        });
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Authentication');
    }
});

// Create or Update Guest (POST /api/auth/guest)
router.post('/auth/guest', async (req, res) => {
    const { mode, guestId, name, nic, passport, phone, email } = req.body;
    
    if (!mode || !name) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: 'mode and name are required.' 
        });
    }
    
    try {
        const sql = `SELECT * FROM manage_guest($1, $2, $3, $4, $5, $6, $7)`;
        const result = await req.app.locals.db.query(sql, [
            mode.toUpperCase(),
            guestId || null,
            name,
            nic || null,
            passport || null,
            phone || null,
            email || null
        ]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Guest operation failed', 
                details: 'could not create or update guest.' 
            });
        }
        
        res.status(200).json({
            guestId: result.rows[0].guest_id,
            guestName: result.rows[0].guest_name,
            guestEmail: result.rows[0].guest_email
        });
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Guest management');
    }
});

module.exports = router;
