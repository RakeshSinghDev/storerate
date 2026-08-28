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

async function runPhase3Tests() {
  console.log('==================================================');
  console.log('    VERIFYING PHASE 3 IMPLEMENTATION (AUTH + RBAC)');
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

  // 1. Normal User Registration
  const testEmail = `phase3_user_${Date.now()}@example.com`;
  const regRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Phase Three Test User Normal Name', email: testEmail, address: '789 Validation Boulevard', password: 'Password123!' }
  );
  assert(regRes.status === 201 && regRes.body.data?.token && regRes.body.data?.user?.role === 'NORMAL_USER', '1. Valid Normal User registration succeeds (201)', JSON.stringify(regRes.body));
  const userToken = regRes.body.data?.token;

  // 2. Privilege Escalation Prevention
  const escRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Phase Three Test User Normal Name', email: `hacker_${Date.now()}@example.com`, address: '789 Validation Boulevard', password: 'Password123!', role: 'SYSTEM_ADMINISTRATOR' }
  );
  assert(escRes.status === 400 && escRes.body.message.includes('Role selection is not permitted'), '2. Registration with "role" field rejected to prevent privilege escalation (400)', JSON.stringify(escRes.body));

  // 3. Validation: Name < 20 chars
  const shortNameRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Short Name', email: 'short@example.com', address: 'Address', password: 'Password123!' }
  );
  assert(shortNameRes.status === 400, '3. Name < 20 chars rejected (400)', JSON.stringify(shortNameRes.body));

  // 4. Validation: Password without special char
  const noSpecRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Phase Three Test User Normal Name', email: 'nospec@example.com', address: 'Address', password: 'Password123' }
  );
  assert(noSpecRes.status === 400, '4. Password without special character rejected (400)', JSON.stringify(noSpecRes.body));

  // 5. Duplicate Email Registration
  const dupRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Phase Three Test User Normal Name', email: testEmail, address: '789 Validation Boulevard', password: 'Password123!' }
  );
  assert(dupRes.status === 409, '5. Duplicate email registration rejected (409)', JSON.stringify(dupRes.body));

  // 6. Login with Incorrect Password
  const badLoginRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: testEmail, password: 'WrongPassword123!' }
  );
  assert(badLoginRes.status === 401, '6. Login with incorrect password rejected (401)', JSON.stringify(badLoginRes.body));

  // 7. Login with Correct Password
  const loginRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: testEmail, password: 'Password123!' }
  );
  assert(loginRes.status === 200 && loginRes.body.data?.token, '7. Login with correct password succeeds (200)', JSON.stringify(loginRes.body));

  // 8. GET /api/auth/me with valid JWT
  const meRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/me', method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } }
  );
  assert(meRes.status === 200 && meRes.body.data?.email === testEmail && meRes.body.data?.password_hash === undefined, '8. GET /api/auth/me with valid JWT returns profile without password_hash', JSON.stringify(meRes.body));

  // 9. GET /api/auth/me without JWT
  const meNoTokRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/me', method: 'GET' }
  );
  assert(meNoTokRes.status === 401, '9. GET /api/auth/me without JWT rejected (401)', JSON.stringify(meNoTokRes.body));

  // 10. GET /api/auth/me with invalid JWT
  const meBadTokRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/me', method: 'GET', headers: { 'Authorization': 'Bearer invalid.token.payload' } }
  );
  assert(meBadTokRes.status === 401, '10. GET /api/auth/me with invalid JWT rejected (401)', JSON.stringify(meBadTokRes.body));

  // 11. Password Update (PUT /api/auth/password)
  const pwdUpdateRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/password', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } },
    { currentPassword: 'Password123!', newPassword: 'NewPassword123!' }
  );
  assert(pwdUpdateRes.status === 200, '11. Password update with correct current password succeeds (200)', JSON.stringify(pwdUpdateRes.body));

  // 12. Login with Updated Password
  const newLoginRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: testEmail, password: 'NewPassword123!' }
  );
  assert(newLoginRes.status === 200, '12. Login with new password succeeds (200)', JSON.stringify(newLoginRes.body));

  // 13. Password Update with Incorrect Current Password
  const wrongCurrentPwdRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/password', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } },
    { currentPassword: 'WrongPassword123!', newPassword: 'AnotherPassword123!' }
  );
  assert(wrongCurrentPwdRes.status === 400, '13. Password update with incorrect current password rejected (400)', JSON.stringify(wrongCurrentPwdRes.body));

  // 14. Admin Login & Access Control Tests
  const adminLoginRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  const adminToken = adminLoginRes.body.data?.token;

  const adminAccessRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/test/admin', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(adminAccessRes.status === 200, '14. Admin user can access /api/test/admin (200)', JSON.stringify(adminAccessRes.body));

  // 15. Normal User blocked from Admin route
  const userAdminAccessRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/test/admin', method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } }
  );
  assert(userAdminAccessRes.status === 403, '15. Normal user blocked from /api/test/admin (403 Forbidden)', JSON.stringify(userAdminAccessRes.body));

  // 16. Store Owner Login & Access Control Tests
  const ownerLoginRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'owner1@supermart.com', password: 'OwnerPass123!' }
  );
  const ownerToken = ownerLoginRes.body.data?.token;

  const ownerAccessRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/test/owner', method: 'GET', headers: { 'Authorization': `Bearer ${ownerToken}` } }
  );
  assert(ownerAccessRes.status === 200, '16. Store Owner user can access /api/test/owner (200)', JSON.stringify(ownerAccessRes.body));

  // 17. Normal User blocked from Owner route
  const userOwnerAccessRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/test/owner', method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } }
  );
  assert(userOwnerAccessRes.status === 403, '17. Normal user blocked from /api/test/owner (403 Forbidden)', JSON.stringify(userOwnerAccessRes.body));

  // 18. Normal User can access Normal User route
  const userUserAccessRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/test/user', method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } }
  );
  assert(userUserAccessRes.status === 200, '18. Normal user can access /api/test/user (200)', JSON.stringify(userUserAccessRes.body));

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase3Tests().catch(console.error);
