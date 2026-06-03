const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Determine if we are connecting to a remote cloud or a local system
const isLocalEnv = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Turn off SSL automatically if we are running locally
    ssl: isLocalEnv ? false : { rejectUnauthorized: false }
});

pool.on('connect', () => {
    console.log('PostgreSQL Database connected successfully!');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

module.exports = pool;