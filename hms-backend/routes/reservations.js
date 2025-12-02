// hms-backend/routes/reservations.js
const express = require('express');
const router = express.Router();

// 1. Create New Reservation (POST /api/reservations/new)
router.post('/reservations/new', async (req, res) => {
    const { guestId, staffId, typeId, checkinDate, checkoutDate, status } = req.body;
    try {
        const sql = `CALL create_reservation($1, $2, $3, $4, $5, $6)`;
        await req.app.locals.db.query(sql, [guestId, staffId, typeId, checkinDate, checkoutDate, status || 'confirmed']); // FIX: Use app.locals.db
        res.status(201).json({ message: 'Reservation created successfully.' });
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Reservation creation');
    }
});

// 2. Check-In (POST /api/checkin)
router.post('/checkin', async (req, res) => {
    const { reservationId, assignedRoomNumber } = req.body;
    try {
        const sql = `CALL checkin_guest($1, $2)`;
        await req.app.locals.db.query(sql, [reservationId, assignedRoomNumber]); // Pass room number
        res.status(200).json({ message: 'Guest checked in successfully.' });
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Check-in');
    }
});

// 3. Check-Out (POST /api/checkout)
router.post('/checkout', async (req, res) => {
    const { reservationId, paymentAmount, paymentType } = req.body;
    try {
        const sql = `CALL process_checkout($1, $2, $3)`;
        await req.app.locals.db.query(sql, [reservationId, paymentAmount, paymentType]); // FIX: Use app.locals.db
        res.status(200).json({ message: 'Guest checked out successfully. Room status set to dirty.' });
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Check-out');
    }
});

// 4. Cancel Reservation (POST /api/reservations/cancel)
router.post('/reservations/cancel', async (req, res) => {
    const { reservationId } = req.body;
    try {
        const sql = `CALL cancel_reservation($1)`;
        await req.app.locals.db.query(sql, [reservationId]); // FIX: Use app.locals.db
        res.status(200).json({ message: 'Reservation canceled and inventory/loyalty reverted.' });
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Cancellation');
    }
});

// 5. Get Outstanding Balance (GET /api/reservations/:id/balance)
router.get('/reservations/:id/balance', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `SELECT * FROM get_outstanding_balance($1)`;
        const result = await req.app.locals.db.query(sql, [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Get balance');
    }
});

// 6. Add Minibar Charge (POST /api/reservations/minibar)
router.post('/reservations/minibar', async (req, res) => {
    const { reservationId, itemId, quantity } = req.body;
    try {
        const sql = `CALL add_minibar_charge($1, $2, $3)`;
        await req.app.locals.db.query(sql, [reservationId, itemId, quantity]);
        res.status(201).json({ message: 'Minibar charge added successfully.' });
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Minibar charge');
    }
});

module.exports = router;