// hms-backend/db.js

const { Pool } = require('pg');

// Check that the DATABASE_URL environment variable is available
if (!process.env.DATABASE_URL) {
    throw new Error('FATAL: DATABASE_URL environment variable is not set. Please check your .env file.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    
    ssl: {
        rejectUnauthorized: false
    },
    
    max: 10, 
    idleTimeoutMillis: 30000 
});

// Test the connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed. Please verify your password in the .env file.', err.stack);
    } else {
        console.log('Database connected successfully.');
    }
});

module.exports = {
    // Export a simple query method for the server.js routes to use
    query: (text, params) => pool.query(text, params),
};