// hms-backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const reservationsRouter = require('./routes/reservations'); 
const adminRouter = require('./routes/admin'); 
const readRouter = require('./routes/read');
const authRouter = require('./routes/auth');

const app = express();
const port = process.env.PORT || 4000;

// Helper function to handle generic errors from the database (for consistency)
const handleDbError = (res, err, action) => {
    console.error(`${action} failed:`, err.message);
    // P0001 is the code for RAISE EXCEPTION from PL/pgSQL
    res.status(err.code === 'P0001' ? 400 : 500).json({ 
        error: `${action} failed`, 
        details: err.message 
    });
};

// Middleware setup
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.locals.db = db;
app.locals.handleDbError = handleDbError;

// Router integration
app.use('/api', authRouter);
app.use('/api', readRouter);
app.use('/api', reservationsRouter);
app.use('/api/admin', adminRouter); 

app.listen(port, () => {
    console.log(`Server running on port ${port}. Architecture: Modular Thin Backend.`);
});