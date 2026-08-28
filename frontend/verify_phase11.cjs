const http = require('http');

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

async function runPhase11Tests() {
  console.log('==================================================');
  console.log('   VERIFYING PHASE 11 IMPLEMENTATION (OWNER UI)');
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

  // 1. Logins & Seed Setup
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

  assert(adminToken && user1Token, '1. Admin & Normal user logins succeeded');

  // Create Owner A & Owner B
  const emailA = `ownerA_${Date.now()}@test.com`;
  const emailB = `ownerB_${Date.now()}@test.com`;

  const ownerARes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Store Owner Alpha Record Name', email: emailA, address: '100 Alpha St', password: 'OwnerPass123!', role: 'STORE_OWNER' }
  );
  const ownerAId = ownerARes.body.data?.id;

  const ownerBRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Store Owner Beta Record Name', email: emailB, address: '200 Beta St', password: 'OwnerPass123!', role: 'STORE_OWNER' }
  );
  const ownerBId = ownerBRes.body.data?.id;

  assert(ownerAId && ownerBId, '2. Created Store Owner A and Store Owner B via Admin API');

  // Create Store A (Owner A) & Store B (Owner B)
  const storeARes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Store Alpha Mart', email: `storeA_${Date.now()}@test.com`, address: '100 Alpha Blvd', ownerId: ownerAId }
  );
  const storeAId = storeARes.body.data?.id;

  const storeBRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Store Beta Plaza', email: `storeB_${Date.now()}@test.com`, address: '200 Beta Blvd', ownerId: ownerBId }
  );
  const storeBId = storeBRes.body.data?.id;

  assert(storeAId && storeBId, '3. Created Store A (Owner A) and Store B (Owner B) via Admin API');

  // User 1 rates Store A (5 stars) and Store B (2 stars)
  await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${storeAId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 5 }
  );
  await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${storeBId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 2 }
  );

  // Login as Owner A
  const loginA = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: emailA, password: 'OwnerPass123!' }
  );
  const tokenA = loginA.body.data?.token;

  // Login as Owner B
  const loginB = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: emailB, password: 'OwnerPass123!' }
  );
  const tokenB = loginB.body.data?.token;

  assert(tokenA && tokenB, '4. Owner A & Owner B logins succeeded');

  // 5. Owner A Dashboard
  const dashA = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${tokenA}` } }
  );
  assert(
    dashA.status === 200 &&
    dashA.body.data?.store?.id === storeAId &&
    dashA.body.data?.store?.name === 'Store Alpha Mart' &&
    dashA.body.data?.averageRating === 5,
    '5. Owner A dashboard returns Store A info and averageRating = 5',
    JSON.stringify(dashA.body.data)
  );

  // 6. Owner B Dashboard
  const dashB = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${tokenB}` } }
  );
  assert(
    dashB.status === 200 &&
    dashB.body.data?.store?.id === storeBId &&
    dashB.body.data?.store?.name === 'Store Beta Plaza' &&
    dashB.body.data?.averageRating === 2,
    '6. Owner B dashboard returns Store B info and averageRating = 2',
    JSON.stringify(dashB.body.data)
  );

  // 7, 8. Cross-Owner Data Isolation Checks
  assert(dashA.body.data?.store?.name !== 'Store Beta Plaza', '7. Cross-Owner Isolation: Owner A NEVER sees Store B');
  assert(dashB.body.data?.store?.name !== 'Store Alpha Mart', '8. Cross-Owner Isolation: Owner B NEVER sees Store A');

  // 9. Pagination Test
  const pageRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard?page=1&limit=1', method: 'GET', headers: { 'Authorization': `Bearer ${tokenA}` } }
  );
  assert(pageRes.status === 200 && pageRes.body.pagination?.limit === 1, '9. Owner dashboard pagination metadata accurate');

  // 10. Unassigned Store Edge Case
  const unassignedRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Unassigned Store Owner Account Record', email: `unassigned_${Date.now()}@test.com`, address: '300 NoStore St', password: 'OwnerPass123!', role: 'STORE_OWNER' }
  );
  const unassignedLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: unassignedRes.body.data?.email, password: 'OwnerPass123!' }
  );
  const unassignedToken = unassignedLogin.body.data?.token;

  const unassignedDash = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${unassignedToken}` } }
  );
  assert(unassignedDash.status === 200 && unassignedDash.body.data?.store === null, '10. Unassigned owner receives store: null response cleanly');

  // 11. Security Tests (NORMAL_USER & SYSTEM_ADMINISTRATOR blocked)
  const normCheck = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(normCheck.status === 403, '11. Normal user blocked from /api/owner/dashboard with 403 Forbidden');

  const adminCheck = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(adminCheck.status === 403, '12. System Admin blocked from /api/owner/dashboard with 403 Forbidden');

  // 13. Owner Password Update
  const passUpdate = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/password', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` } },
    { currentPassword: 'OwnerPass123!', newPassword: 'NewOwnerPass123!' }
  );
  assert(passUpdate.status === 200, '13. Owner A password update succeeds (200 OK)');

  // 14. Owner Login with Updated Password
  const newOwnerALogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: emailA, password: 'NewOwnerPass123!' }
  );
  assert(newOwnerALogin.status === 200 && newOwnerALogin.body.data?.token, '14. Owner A login with updated password succeeds');

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase11Tests().catch(console.error);
