// hms-backend/routes/read.js
const express = require('express');
const router = express.Router();

// Helper to call generic read functions (Simplifies structure)
const getListRoute = (endpoint, funcName) => {
    router.get(endpoint, async (req, res) => {
        try {
            const sql = `SELECT * FROM ${funcName}();`;
            // Use req.app.locals.db
            const result = await req.app.locals.db.query(sql); 
            res.status(200).json(result.rows);
        } catch (err) {
            req.app.locals.handleDbError(res, err, `Fetching ${funcName}`);
        }
    });
};

getListRoute('/reservations/list', 'list_reservations');
getListRoute('/rooms/list/all', 'list_all_rooms');

// Room types endpoint (needs direct query as no function exists)
router.get('/rooms/types', async (req, res) => {
    try {
        const sql = `SELECT typeID as type_id, name, description, maxCapacity as max_capacity FROM room_type ORDER BY typeID`;
        const result = await req.app.locals.db.query(sql);
        res.status(200).json(result.rows);
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Fetching room types');
    }
});

getListRoute('/guests/list', 'list_all_guests');
getListRoute('/staff/list', 'list_all_staff');
getListRoute('/service-items/list', 'list_service_items');

// Get available rooms for check-in by type ID
router.get('/rooms/available/:typeId', async (req, res) => {
    const typeId = parseInt(req.params.typeId);
    
    if (isNaN(typeId)) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: 'Invalid type ID.' 
        });
    }
    
    try {
        const sql = `SELECT * FROM get_available_rooms_for_checkin($1);`;
        const result = await req.app.locals.db.query(sql, [typeId]);
        res.status(200).json(result.rows);
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Fetching available rooms');
    }
});

// Get reservation details (GET /api/reservations/:id)
router.get('/reservations/:id', async (req, res) => {
    const reservationId = parseInt(req.params.id);
    
    if (isNaN(reservationId)) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: 'invalid reservation ID.' 
        });
    }
    
    try {
        const sql = `SELECT * FROM get_reservation_details($1);`;
        const result = await req.app.locals.db.query(sql, [reservationId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Not found', 
                details: 'reservation not found.' 
            });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Fetching reservation details');
    }
});

// Get reservation charges (GET /api/reservations/:id/charges)
router.get('/reservations/:id/charges', async (req, res) => {
    const reservationId = parseInt(req.params.id);
    
    if (isNaN(reservationId)) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: 'invalid reservation ID.' 
        });
    }
    
    try {
        const sql = `SELECT * FROM get_reservation_charges($1);`;
        const result = await req.app.locals.db.query(sql, [reservationId]);
        res.status(200).json(result.rows);
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Fetching reservation charges');
    }
});

// Get reservation payments (GET /api/reservations/:id/payments)
router.get('/reservations/:id/payments', async (req, res) => {
    const reservationId = parseInt(req.params.id);
    
    if (isNaN(reservationId)) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: 'invalid reservation ID.' 
        });
    }
    
    try {
        const sql = `SELECT * FROM get_reservation_payments($1);`;
        const result = await req.app.locals.db.query(sql, [reservationId]);
        res.status(200).json(result.rows);
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Fetching reservation payments');
    }
});

module.exports = router;