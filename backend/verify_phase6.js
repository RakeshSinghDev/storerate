const http = require('http');
const { pool } = require('./config/db');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runPhase6Tests() {
  console.log('==================================================');
  console.log('    VERIFYING PHASE 6 IMPLEMENTATION (STORE OWNER)');
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

  // 1. Initial Logins
  const ownerALogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'owner1@supermart.com', password: 'OwnerPass123!' }
  );
  const ownerAToken = ownerALogin.body.data?.token;

  const adminLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  const adminToken = adminLogin.body.data?.token;

  const user1Login = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'user1@gmail.com', password: 'UserPass123!' }
  );
  const user1Token = user1Login.body.data?.token;

  const user2Login = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'user2@gmail.com', password: 'UserPass123!' }
  );
  const user2Token = user2Login.body.data?.token;

  assert(ownerAToken && adminToken && user1Token && user2Token, '1. Initial user logins succeeded');

  // 2. Admin creates Owner B and Store B
  const createOwnerB = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Store Owner B Account Name', email: `ownerB_${Date.now()}@test.com`, address: '200 Owner B St', password: 'OwnerBPass123!', role: 'STORE_OWNER' }
  );
  const ownerBId = createOwnerB.body.data?.id;

  const createStoreB = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Store B Emporium', email: `storeB_${Date.now()}@store.com`, address: '200 Store B Blvd', ownerId: ownerBId }
  );
  const storeBId = createStoreB.body.data?.id;

  const ownerBLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: createOwnerB.body.data?.email, password: 'OwnerBPass123!' }
  );
  const ownerBToken = ownerBLogin.body.data?.token;

  // 3. Ratings submission (User 1 -> Store A (id:1), User 2 -> Store B)
  await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1/ratings', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 5 }
  );

  await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${storeBId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 4 }
  );

  // 4. Owner A Dashboard verification
  const ownerADashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${ownerAToken}` } }
  );
  assert(
    ownerADashRes.status === 200 &&
    ownerADashRes.body.data?.store?.id === 1 &&
    typeof ownerADashRes.body.data?.averageRating === 'number' &&
    ownerADashRes.body.data?.ratingCount > 0,
    '2. Owner A dashboard returns Store A info and correct rating summary',
    JSON.stringify(ownerADashRes.body.data)
  );

  // 5. Ratings list details & non-sensitive check
  const ownerARatings = ownerADashRes.body.data?.ratings || [];
  const firstRating = ownerARatings[0];
  assert(
    firstRating &&
    typeof firstRating.userId === 'number' &&
    typeof firstRating.userName === 'string' &&
    typeof firstRating.rating === 'number' &&
    firstRating.createdAt &&
    firstRating.password_hash === undefined,
    '3. Ratings list contains userId, userName, rating, createdAt and omits password_hash',
    JSON.stringify(firstRating)
  );

  // 6. Owner B Dashboard verification
  const ownerBDashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${ownerBToken}` } }
  );
  assert(
    ownerBDashRes.status === 200 &&
    ownerBDashRes.body.data?.store?.id === storeBId &&
    ownerBDashRes.body.data?.ratings?.length === 1 &&
    ownerBDashRes.body.data?.ratings[0]?.rating === 4,
    '4. Owner B dashboard returns Store B info and Store B ratings only',
    JSON.stringify(ownerBDashRes.body.data)
  );

  // 7. Attack Test: Owner A passes ?storeId=<StoreB_ID>
  const attackRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/owner/dashboard?storeId=${storeBId}`, method: 'GET', headers: { 'Authorization': `Bearer ${ownerAToken}` } }
  );
  assert(
    attackRes.status === 200 && attackRes.body.data?.store?.id === 1,
    '5. Ownership bypass attempt ?storeId=B ignored; safely returns Owner A store only',
    JSON.stringify(attackRes.body.data?.store)
  );

  // 8. Owner without a store test
  const createOwnerC = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Store Owner C Without Store Name', email: `ownerC_${Date.now()}@test.com`, address: '300 Owner C St', password: 'OwnerCPass123!', role: 'STORE_OWNER' }
  );
  const ownerCLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: createOwnerC.body.data?.email, password: 'OwnerCPass123!' }
  );
  const ownerCToken = ownerCLogin.body.data?.token;

  const ownerCDashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${ownerCToken}` } }
  );
  assert(
    ownerCDashRes.status === 200 &&
    ownerCDashRes.body.data?.store === null &&
    ownerCDashRes.body.data?.averageRating === null &&
    ownerCDashRes.body.data?.ratingCount === 0 &&
    Array.isArray(ownerCDashRes.body.data?.ratings) && ownerCDashRes.body.data?.ratings.length === 0,
    '6. Owner without store returns store: null, averageRating: null, ratingCount: 0, ratings: []',
    JSON.stringify(ownerCDashRes.body.data)
  );

  // 9. Clean Separate Endpoints (/store & /ratings)
  const ownerStoreRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/store', method: 'GET', headers: { 'Authorization': `Bearer ${ownerAToken}` } }
  );
  assert(ownerStoreRes.status === 200 && ownerStoreRes.body.data?.store?.id === 1, '7. GET /api/owner/store returns owner store summary', JSON.stringify(ownerStoreRes.body.data));

  const ownerRatingsRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/ratings?page=1&limit=2', method: 'GET', headers: { 'Authorization': `Bearer ${ownerAToken}` } }
  );
  assert(ownerRatingsRes.status === 200 && Array.isArray(ownerRatingsRes.body.data) && ownerRatingsRes.body.pagination, '8. GET /api/owner/ratings returns paginated ratings list', JSON.stringify(ownerRatingsRes.body));

  // 10. Access Control Checks
  const userDashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(userDashRes.status === 403, '9. Normal User blocked from GET /api/owner/dashboard (403)', JSON.stringify(userDashRes.body));

  const adminDashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(adminDashRes.status === 403, '10. System Admin blocked from GET /api/owner/dashboard (403)', JSON.stringify(adminDashRes.body));

  const noTokenRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET' }
  );
  assert(noTokenRes.status === 401, '11. Request without JWT rejected (401)', JSON.stringify(noTokenRes.body));

  const invalidTokenRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': 'Bearer invalid.jwt.token' } }
  );
  assert(invalidTokenRes.status === 401, '12. Request with invalid JWT rejected (401)', JSON.stringify(invalidTokenRes.body));

  // 11. Password update verification for STORE_OWNER
  const updatePassRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/password', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerAToken}` } },
    { currentPassword: 'OwnerPass123!', newPassword: 'NewOwnerPass123!' }
  );
  assert(updatePassRes.status === 200, '13. Store Owner can update password via PUT /api/auth/password (200)', JSON.stringify(updatePassRes.body));

  const newPassLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'owner1@supermart.com', password: 'NewOwnerPass123!' }
  );
  assert(newPassLogin.status === 200 && newPassLogin.body.data?.token, '14. Store Owner login with updated password succeeds (200)');

  // 12. Direct PostgreSQL Database Verification
  const dbStoreRes = await pool.query(
    `SELECT s.id AS store_id, ROUND(AVG(r.rating)::numeric, 1)::float AS avg, COUNT(r.id)::int AS count
     FROM stores s
     JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = (SELECT id FROM users WHERE email = 'owner1@supermart.com')
     GROUP BY s.id`
  );
  const dbAvg = dbStoreRes.rows[0].avg;
  const dbCount = dbStoreRes.rows[0].count;

  const apiDashSummary = ownerADashRes.body.data;
  assert(dbAvg === apiDashSummary.averageRating && dbCount === apiDashSummary.ratingCount, '15. Direct SQL aggregate query matches Owner Dashboard summary exactly', `SQL (Avg: ${dbAvg}, Count: ${dbCount}) vs API (Avg: ${apiDashSummary.averageRating}, Count: ${apiDashSummary.ratingCount})`);

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase6Tests().catch(console.error);
