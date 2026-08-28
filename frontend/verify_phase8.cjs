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

async function runPhase8Tests() {
  console.log('==================================================');
  console.log('    VERIFYING PHASE 8 IMPLEMENTATION (FRONTEND)');
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

  // 1. Frontend Dev Server Check
  const feRes = await request({ host: '127.0.0.1', port: 5173, path: '/', method: 'GET' });
  assert(feRes.status === 200, '1. Frontend Vite dev server responding on http://localhost:5173 (200)');

  // 2. Backend Health Check
  const beRes = await request({ host: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
  assert(beRes.status === 200 && beRes.body.success === true, '2. Backend API responding on http://localhost:5000/api/health (200)');

  // 3. User Registration API Integration (NORMAL_USER)
  const regEmail = `fe_user_${Date.now()}@test.com`;
  const regRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Frontend Test User Account Record Name', email: regEmail, address: '123 Frontend Avenue, City', password: 'UserPass123!' }
  );
  assert(regRes.status === 201 && regRes.body.data?.user?.role === 'NORMAL_USER', '3. Registration API succeeds and assigns NORMAL_USER role', JSON.stringify(regRes.body));

  // 4. User Login API Integration
  const loginRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: regEmail, password: 'UserPass123!' }
  );
  const token = loginRes.body.data?.token;
  assert(loginRes.status === 200 && token, '4. Login API succeeds and returns valid JWT token', JSON.stringify(loginRes.body.data));

  // 5. Auth /me API Verification
  const meRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/me', method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
  );
  assert(meRes.status === 200 && meRes.body.data?.email === regEmail, '5. GET /api/auth/me returns authenticated user profile', JSON.stringify(meRes.body.data));

  // 6. Password Update API Integration
  const passUpdateRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/password', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } },
    { currentPassword: 'UserPass123!', newPassword: 'NewUserPass123!' }
  );
  assert(passUpdateRes.status === 200, '6. Password update API succeeds (200 OK)', JSON.stringify(passUpdateRes.body));

  // 7. Login with new password
  const newLoginRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: regEmail, password: 'NewUserPass123!' }
  );
  assert(newLoginRes.status === 200 && newLoginRes.body.data?.token, '7. Login with updated password succeeds', JSON.stringify(newLoginRes.body.data));

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase8Tests().catch(console.error);
