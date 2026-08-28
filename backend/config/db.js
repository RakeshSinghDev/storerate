const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Construct pool configuration supporting DATABASE_URL (Render) or discrete DB parameters
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : (process.env.DB_SSL === 'true' || isProduction ? { rejectUnauthorized: false } : false),
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'store_rating',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

// Helper query function with error logging
const query = (text, params) => pool.query(text, params);

// Connection test helper function
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() AS current_time, current_database() AS db_name');
    console.log(`Database connected successfully to [${res.rows[0].db_name}] at ${res.rows[0].current_time}`);
    return true;
  } catch (err) {
    console.error('CRITICAL: Database connection failed:', err.message);
    throw err;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
