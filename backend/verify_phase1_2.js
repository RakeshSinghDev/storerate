const { pool, testConnection } = require('./config/db');
const http = require('http');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('==================================================');
  console.log('    VERIFYING PHASE 1 & PHASE 2 IMPLEMENTATION');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - Details: ${details}`);
      failed++;
    }
  }

  try {
    // 1. PostgreSQL Connection Test
    await testConnection();
    assert(true, '1. PostgreSQL Connection test succeeded');

    // 2. Health check endpoint test
    const healthRes = await httpGet('http://localhost:5000/api/health');
    assert(
      healthRes.status === 200 && healthRes.body.success === true && healthRes.body.message === 'API is running',
      '2. GET /api/health returned expected JSON response',
      JSON.stringify(healthRes.body)
    );

    // 3. Verify Tables Exist in PostgreSQL
    const tablesRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`
    );
    const tableNames = tablesRes.rows.map(r => r.table_name);
    assert(
      tableNames.includes('users') && tableNames.includes('stores') && tableNames.includes('ratings'),
      '3. Verified tables (users, stores, ratings) exist in database',
      tableNames.join(', ')
    );

    // 4. Verify Seed Data
    const usersCount = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    const storesCount = await pool.query('SELECT COUNT(*)::int AS count FROM stores');
    const ratingsCount = await pool.query('SELECT COUNT(*)::int AS count FROM ratings');
    assert(
      usersCount.rows[0].count === 5 && storesCount.rows[0].count === 3 && ratingsCount.rows[0].count === 4,
      '4. Seed data populated correctly across all 3 tables',
      `Users: ${usersCount.rows[0].count}, Stores: ${storesCount.rows[0].count}, Ratings: ${ratingsCount.rows[0].count}`
    );

    // 5. Verify Password Hashing (No plaintext passwords)
    const pwCheck = await pool.query('SELECT password_hash FROM users');
    const allHashed = pwCheck.rows.every(r => r.password_hash.startsWith('$2a$') || r.password_hash.startsWith('$2b$'));
    assert(allHashed, '5. Passwords in database are properly hashed with bcrypt');

    // 6. Constraint Test: Rating < 1 (e.g. 0) rejected by CHECK constraint
    try {
      await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (1, 3, 0)');
      assert(false, '6. Rating 0 rejected by CHECK constraint');
    } catch (err) {
      assert(err.code === '23514', '6. Rating 0 rejected by CHECK constraint (23514)');
    }

    // 7. Constraint Test: Rating > 5 (e.g. 6) rejected by CHECK constraint
    try {
      await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (1, 3, 6)');
      assert(false, '7. Rating 6 rejected by CHECK constraint');
    } catch (err) {
      assert(err.code === '23514', '7. Rating 6 rejected by CHECK constraint (23514)');
    }

    // 8. Constraint Test: Duplicate Email rejected
    try {
      await pool.query(`INSERT INTO users (name, email, password_hash, address, role) VALUES ('Test Dup Name Long Enough', 'admin@platform.com', 'hash', 'addr', 'NORMAL_USER')`);
      assert(false, '8. Duplicate email rejected by UNIQUE constraint');
    } catch (err) {
      assert(err.code === '23505', '8. Duplicate email rejected by UNIQUE constraint (23505)');
    }

    // 9. Constraint Test: Duplicate (user_id, store_id) rating rejected
    try {
      // user 4 already rated store 1 in seed data
      await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (4, 1, 5)');
      assert(false, '9. Duplicate (user_id, store_id) rating rejected');
    } catch (err) {
      assert(err.code === '23505', '9. Duplicate (user_id, store_id) rating rejected by UNIQUE constraint (23505)');
    }

    // 10. Foreign Key Integrity Test: Invalid owner_id rejected
    try {
      await pool.query(`INSERT INTO stores (name, email, address, owner_id) VALUES ('Invalid Store', 'invalid@store.com', '123 St', 999999)`);
      assert(false, '10. Foreign key invalid owner_id rejected');
    } catch (err) {
      assert(err.code === '23503', '10. Foreign key invalid owner_id rejected (23503)');
    }

  } catch (err) {
    console.error('Verification error:', err);
    failed++;
  } finally {
    console.log('\n==================================================');
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runVerification();
