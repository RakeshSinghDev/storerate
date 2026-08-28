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

async function runPhase7AuditTests() {
  console.log('==================================================');
  console.log('   VERIFYING PHASE 7 IMPLEMENTATION (AUDIT & HARDENING)');
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

  // 1. Health check
  const healthRes = await request({ host: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
  assert(healthRes.status === 200 && healthRes.body.success === true, '1. GET /api/health returns 200 OK');

  // 2. Authentication & Logins
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
  const user1Id = user1Login.body.data?.user?.id;

  const user2Login = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'user2@gmail.com', password: 'UserPass123!' }
  );
  const user2Token = user2Login.body.data?.token;

  const owner1Login = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'owner1@supermart.com', password: 'OwnerPass123!' }
  );
  const owner1Token = owner1Login.body.data?.token;

  assert(adminToken && user1Token && user2Token && owner1Token, '2. All role logins succeeded and generated tokens');

  // 3. Password Hash & Secret Leakage Prevention
  const meRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/me', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(
    meRes.status === 200 &&
    meRes.body.data?.id === user1Id &&
    meRes.body.data?.password_hash === undefined &&
    meRes.body.data?.password === undefined,
    '3. GET /api/auth/me returns user profile and NEVER exposes password_hash',
    JSON.stringify(meRes.body)
  );

  // 4. Privilege Escalation Defense: Body role parameter rejection
  const privEscRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Malicious Privilege Escalation User', email: `hacker_${Date.now()}@test.com`, address: '100 Hacking St', password: 'HackerPass123!', role: 'SYSTEM_ADMINISTRATOR' }
  );
  assert(privEscRes.status === 400 && privEscRes.body.message.includes('not permitted'), '4. Registration with "role" parameter in payload rejected (400)', JSON.stringify(privEscRes.body));

  // 5. Validation Boundary Tests - Name
  const name19 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: '1234567890123456789', email: `name19_${Date.now()}@test.com`, address: '100 Valid St', password: 'UserPass123!' }
  );
  assert(name19.status === 400, '5. Name with 19 characters rejected (400)');

  const name20 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: '12345678901234567890', email: `name20_${Date.now()}@test.com`, address: '100 Valid St', password: 'UserPass123!' }
  );
  assert(name20.status === 201, '6. Name with 20 characters accepted (201)');

  const name60 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'A'.repeat(60), email: `name60_${Date.now()}@test.com`, address: '100 Valid St', password: 'UserPass123!' }
  );
  assert(name60.status === 201, '7. Name with 60 characters accepted (201)');

  const name61 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'A'.repeat(61), email: `name61_${Date.now()}@test.com`, address: '100 Valid St', password: 'UserPass123!' }
  );
  assert(name61.status === 400, '8. Name with 61 characters rejected (400)');

  // 6. Validation Boundary Tests - Address
  const addr400 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Account Name Boundary Test 400', email: `addr400_${Date.now()}@test.com`, address: 'B'.repeat(400), password: 'UserPass123!' }
  );
  assert(addr400.status === 201, '9. Address with 400 characters accepted (201)');

  const addr401 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Account Name Boundary Test 401', email: `addr401_${Date.now()}@test.com`, address: 'B'.repeat(401), password: 'UserPass123!' }
  );
  assert(addr401.status === 400, '10. Address with 401 characters rejected (400)');

  // 7. Validation Boundary Tests - Password
  const pass7 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Account Name Boundary Test Pass7', email: `pass7_${Date.now()}@test.com`, address: '100 Valid St', password: 'Pass1!' }
  );
  assert(pass7.status === 400, '11. Password with 7 characters rejected (400)');

  const pass8 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Account Name Boundary Test Pass8', email: `pass8_${Date.now()}@test.com`, address: '100 Valid St', password: 'Pass123!' }
  );
  assert(pass8.status === 201, '12. Password with 8 characters accepted (201)');

  const pass16 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Account Name Boundary Test Pass16', email: `pass16_${Date.now()}@test.com`, address: '100 Valid St', password: 'Pass12345678901!' }
  );
  assert(pass16.status === 201, '13. Password with 16 characters accepted (201)');

  const pass17 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Account Name Boundary Test Pass17', email: `pass17_${Date.now()}@test.com`, address: '100 Valid St', password: 'Pass123456789012!' }
  );
  assert(pass17.status === 400, '14. Password with 17 characters rejected (400)');

  const passNoUpper = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Account Name Boundary Test NoUpper', email: `noupper_${Date.now()}@test.com`, address: '100 Valid St', password: 'userpass123!' }
  );
  assert(passNoUpper.status === 400, '15. Password without uppercase letter rejected (400)');

  const passNoSpecial = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Account Name Boundary Test NoSpecial', email: `nospec_${Date.now()}@test.com`, address: '100 Valid St', password: 'UserPass123' }
  );
  assert(passNoSpecial.status === 400, '16. Password without special character rejected (400)');

  // 8. Validation Boundary Tests - Rating
  const createTestStore = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Audit Test Store Emporium', email: `audit_store_${Date.now()}@store.com`, address: '100 Audit Store Way' }
  );
  const auditStoreId = createTestStore.body.data?.id;

  const rate0 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${auditStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 0 }
  );
  assert(rate0.status === 400, '17. Rating 0 rejected (400)');

  const rate1 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${auditStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 1 }
  );
  assert(rate1.status === 201, '18. Rating 1 accepted (201)');

  const rateDup = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${auditStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 5 }
  );
  assert(rateDup.status === 409, '19. Duplicate rating submission for same store returns 409 Conflict');

  const rate6 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${auditStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 6 }
  );
  assert(rate6.status === 400, '20. Rating 6 rejected (400)');

  const rateFloat = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${auditStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 4.5 }
  );
  assert(rateFloat.status === 400, '21. Float rating 4.5 rejected (400)');

  const rate5 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${auditStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 5 }
  );
  assert(rate5.status === 201, '22. Rating 5 accepted (201)');

  // 9. Authorization Matrix Audits
  const userAdminRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(userAdminRes.status === 403, '23. Normal User calling Admin endpoint returns 403 Forbidden');

  const ownerAdminRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'GET', headers: { 'Authorization': `Bearer ${owner1Token}` } }
  );
  assert(ownerAdminRes.status === 403, '24. Store Owner calling Admin endpoint returns 403 Forbidden');

  const userOwnerRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(userOwnerRes.status === 403, '25. Normal User calling Owner endpoint returns 403 Forbidden');

  const adminOwnerRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(adminOwnerRes.status === 403, '26. System Admin calling Owner endpoint returns 403 Forbidden');

  const ownerRateRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${auditStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${owner1Token}` } },
    { rating: 5 }
  );
  assert(ownerRateRes.status === 403, '27. Store Owner calling Normal User rating endpoint returns 403 Forbidden');

  // 10. Admin Store Creation Owner Validation Audits
  const normalOwnerStore = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Invalid Store Assignment', email: `invalid_${Date.now()}@store.com`, address: '100 Way', ownerId: user1Id }
  );
  assert(normalOwnerStore.status === 400 && normalOwnerStore.body.message.includes('STORE_OWNER'), '28. Creating store with NORMAL_USER as owner rejected (400)');

  // 11. SQL Aggregation & Direct DB Integrity Verification
  const dbCheck = await pool.query(
    `SELECT ROUND(AVG(rating)::numeric, 1)::float AS avg, COUNT(id)::int AS count FROM ratings WHERE store_id = $1`,
    [auditStoreId]
  );
  const apiCheck = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${auditStoreId}/ratings`, method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(
    dbCheck.rows[0].avg === apiCheck.body.data?.averageRating &&
    dbCheck.rows[0].count === apiCheck.body.data?.ratingCount,
    '29. Direct PostgreSQL aggregate query matches API summary exactly (Avg: 3.0, Count: 2)',
    `DB: ${JSON.stringify(dbCheck.rows[0])} vs API: ${JSON.stringify(apiCheck.body.data)}`
  );

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase7AuditTests().catch(console.error);
