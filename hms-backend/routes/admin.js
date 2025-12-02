// hms-backend/routes/admin.js
const express = require('express');
const router = express.Router();

// 1. Manage Service Items (POST /api/admin/service-item)
router.post('/service-item', async (req, res) => {
    const { mode, itemId, name, price } = req.body;
    try {
        const sql = `CALL manage_service_item($1, $2, $3, $4)`;
        await req.app.locals.db.query(sql, [mode, itemId, name, price]); // FIX: Use app.locals.db
        res.status(200).json({ message: `Service item operation (${mode}) completed.` });
    } catch (err) {
        req.app.locals.handleDbError(res, err, `Service Item ${mode}`);
    }
});

// 2. Manage Room Config (POST /api/admin/room)
router.post('/room', async (req, res) => {
    const { mode, roomId, roomNumber, typeId, status } = req.body;
    try {
        const sql = `CALL manage_room_config($1, $2, $3, $4, $5)`;
        await req.app.locals.db.query(sql, [mode, roomId, roomNumber, typeId, status]); // FIX: Use app.locals.db
        res.status(200).json({ message: `Room configuration operation (${mode}) completed.` });
    } catch (err) {
        req.app.locals.handleDbError(res, err, `Room Config ${mode}`);
    }
});

// 3. Housekeeping Status Update (POST /api/admin/rooms/clean)
router.post('/rooms/clean', async (req, res) => {
    const { roomId } = req.body;
    try {
        const sql = `CALL update_room_status_clean($1)`;
        await req.app.locals.db.query(sql, [roomId]); // FIX: Use app.locals.db
        res.status(200).json({ message: `Room ${roomId} marked as clean and available.` });
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Cleaning status update');
    }
});

// 4. List Rate Plans (GET /api/admin/rate-plans)
router.get('/rate-plans', async (req, res) => {
    try {
        const sql = `SELECT * FROM list_rate_plans()`;
        const result = await req.app.locals.db.query(sql);
        res.status(200).json(result.rows);
    } catch (err) {
        req.app.locals.handleDbError(res, err, 'Fetching rate plans');
    }
});

// 5. Manage Rate Plan (POST /api/admin/rate-plan)
router.post('/rate-plan', async (req, res) => {
    const { mode, ratePlanId, typeId, name, dailyRate, startDate, endDate } = req.body;
    try {
        const sql = `CALL manage_rate_plan($1, $2, $3, $4, $5, $6, $7)`;
        await req.app.locals.db.query(sql, [mode, ratePlanId, typeId, name, dailyRate, startDate, endDate]);
        res.status(200).json({ message: `Rate plan operation (${mode}) completed.` });
    } catch (err) {
        req.app.locals.handleDbError(res, err, `Rate Plan ${mode}`);
    }
});

module.exports = router;