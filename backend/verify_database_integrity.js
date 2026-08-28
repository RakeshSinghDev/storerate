const pool = require('./config/db');

async function verifyDatabaseIntegrity() {
  console.log('==================================================');
  console.log('    PHASE 12: DATABASE INTEGRITY VERIFICATION');
  console.log('==================================================\n');

  try {
    // 1. Table Counts
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const storeCount = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingCount = await pool.query('SELECT COUNT(*) FROM ratings');

    console.log(`[DB] Users table row count: ${userCount.rows[0].count}`);
    console.log(`[DB] Stores table row count: ${storeCount.rows[0].count}`);
    console.log(`[DB] Ratings table row count: ${ratingCount.rows[0].count}\n`);

    // 2. Check for Duplicate Ratings (Should be 0)
    const dupCheck = await pool.query(`
      SELECT user_id, store_id, COUNT(*)
      FROM ratings
      GROUP BY user_id, store_id
      HAVING COUNT(*) > 1
    `);

    if (dupCheck.rows.length === 0) {
      console.log('[PASS] Rating Integrity: 0 duplicate ratings found in PostgreSQL database.');
    } else {
      console.error('[FAIL] Duplicate ratings detected:', dupCheck.rows);
    }

    // 3. Store Aggregates Comparison
    const aggregates = await pool.query(`
      SELECT
        s.id AS store_id,
        s.name AS store_name,
        ROUND(AVG(r.rating), 2) AS avg_rating,
        COUNT(r.id) AS rating_count
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name
      ORDER BY s.id ASC
    `);

    console.log('\n[DB] Store Rating Aggregates:');
    console.table(aggregates.rows);

    process.exit(0);
  } catch (err) {
    console.error('[FAIL] Database verification failed:', err);
    process.exit(1);
  }
}

verifyDatabaseIntegrity();
