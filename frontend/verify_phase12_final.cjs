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

async function runMasterE2ETests() {
  console.log('====================================================================');
  console.log('   PHASE 12: MASTER END-TO-END INTEGRATION & SECURITY TEST SUITE');
  console.log('====================================================================\n');

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

  // 1. Health Checks
  const beHealth = await request({ host: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
  assert(beHealth.status === 200 && beHealth.body.success === true, '1. Express Backend health check (http://localhost:5000/api/health)');

  const feHealth = await request({ host: '127.0.0.1', port: 5173, path: '/', method: 'GET' });
  assert(feHealth.status === 200, '2. Vite Frontend dev server check (http://localhost:5173)');

  // 2. Normal User Complete Journey
  const userEmail = `e2e_norm_${Date.now()}@test.com`;
  const regRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'E2E Normal User Account Record Name', email: userEmail, address: '123 E2E Street, City', password: 'UserPass123!' }
  );
  assert(regRes.status === 201 && regRes.body.data?.user?.role === 'NORMAL_USER', '3. Public User Registration enforces NORMAL_USER role');

  const normLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: userEmail, password: 'UserPass123!' }
  );
  const normToken = normLogin.body.data?.token;
  assert(normLogin.status === 200 && normToken, '4. Normal User Login returns valid JWT token');

  const normProfile = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/me', method: 'GET', headers: { 'Authorization': `Bearer ${normToken}` } }
  );
  assert(normProfile.status === 200 && !normProfile.body.data?.password_hash, '5. GET /api/auth/me returns profile without password_hash');

  const storesList = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores', method: 'GET', headers: { 'Authorization': `Bearer ${normToken}` } }
  );
  assert(storesList.status === 200 && Array.isArray(storesList.body.data), '6. Normal User Store Discovery (GET /api/stores)');

  const searchRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?name=Apex', method: 'GET', headers: { 'Authorization': `Bearer ${normToken}` } }
  );
  assert(searchRes.status === 200 && searchRes.body.data?.length > 0, '7. Store Search by Name (ILIKE)');

  const ratePost = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1/ratings', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${normToken}` } },
    { rating: 5 }
  );
  assert(ratePost.status === 201 && ratePost.body.data?.rating === 5, '8. Normal User submits 5-star rating (POST 201)');

  const ratePut = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1/ratings', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${normToken}` } },
    { rating: 4 }
  );
  assert(ratePut.status === 200 && ratePut.body.data?.rating === 4, '9. Normal User modifies rating to 4 stars (PUT 200)');

  // 3. System Administrator Complete Journey
  const adminLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  const adminToken = adminLogin.body.data?.token;
  assert(adminLogin.status === 200 && adminToken, '10. System Administrator Login');

  const dashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(dashRes.status === 200 && typeof dashRes.body.data?.totalUsers === 'number', '11. Admin Dashboard returns real PostgreSQL stats');

  // Admin creates STORE_OWNER
  const ownerEmail = `e2e_owner_${Date.now()}@test.com`;
  const createOwnerRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'E2E Store Owner Account Name Record', email: ownerEmail, address: '456 Owner Blvd', password: 'OwnerPass123!', role: 'STORE_OWNER' }
  );
  const newOwnerId = createOwnerRes.body.data?.id;
  assert(createOwnerRes.status === 201 && newOwnerId, '12. Admin creates STORE_OWNER account');

  // Admin creates Store assigned to new STORE_OWNER
  const createStoreRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'E2E Test Store Emporium', email: `e2e_store_${Date.now()}@test.com`, address: '789 Emporium St', ownerId: newOwnerId }
  );
  const newStoreId = createStoreRes.body.data?.id;
  assert(createStoreRes.status === 201 && newStoreId, '13. Admin creates store assigned to valid STORE_OWNER');

  // 4. Store Owner Complete Journey
  const ownerLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: ownerEmail, password: 'OwnerPass123!' }
  );
  const ownerToken = ownerLogin.body.data?.token;
  assert(ownerLogin.status === 200 && ownerToken, '14. Store Owner Login');

  const ownerDash = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${ownerToken}` } }
  );
  assert(ownerDash.status === 200 && ownerDash.body.data?.store?.id === newStoreId, '15. Store Owner Dashboard returns assigned store info');

  // 5. Authorization Matrix & Security Attack Verification
  const regPrivEscalation = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Attacker Account Name Record', email: `hack_${Date.now()}@test.com`, address: '123 Hack St', password: 'HackPass123!', role: 'SYSTEM_ADMINISTRATOR' }
  );
  assert(regPrivEscalation.status === 400 && regPrivEscalation.body.message.includes('not permitted'), '16. Security: Registration role injection rejected with 400 Bad Request', JSON.stringify(regPrivEscalation.body));

  const normToAdmin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${normToken}` } }
  );
  assert(normToAdmin.status === 403, '17. Security: NORMAL_USER blocked from /api/admin/dashboard (403)');

  const normToOwner = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${normToken}` } }
  );
  assert(normToOwner.status === 403, '18. Security: NORMAL_USER blocked from /api/owner/dashboard (403)');

  const adminToOwner = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(adminToOwner.status === 403, '19. Security: SYSTEM_ADMINISTRATOR blocked from /api/owner/dashboard (403)');

  const invalidOwnerStore = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Invalid Owner Store Name', email: `inv_${Date.now()}@test.com`, address: '999 Fail St', ownerId: regRes.body.data?.user?.id }
  );
  assert(invalidOwnerStore.status === 400, '20. Security: Store creation with NORMAL_USER owner rejected (400)');

  // 6. Rating Integrity Verification
  const dupRating = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1/ratings', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${normToken}` } },
    { rating: 5 }
  );
  assert(dupRating.status === 409, '21. Rating Integrity: Duplicate rating POST rejected with 409 Conflict');

  // 7. Validation Boundaries Verification
  const shortName = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Short Name', email: `short_${Date.now()}@test.com`, address: '123 St', password: 'UserPass123!' }
  );
  assert(shortName.status === 400, '22. Boundary: Name length < 20 rejected (400)');

  const longPass = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Full Name Account Record', email: `long_${Date.now()}@test.com`, address: '123 St', password: 'PasswordTooLong123!Extra' }
  );
  assert(longPass.status === 400, '23. Boundary: Password length > 16 rejected (400)');

  const noSpecialPass = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid Full Name Account Record', email: `nospec_${Date.now()}@test.com`, address: '123 St', password: 'Password123' }
  );
  assert(noSpecialPass.status === 400, '24. Boundary: Password missing special character rejected (400)');

  const rate0 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1/ratings', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${normToken}` } },
    { rating: 0 }
  );
  assert(rate0.status === 400, '25. Boundary: Rating 0 rejected (400)');

  const rate6 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1/ratings', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${normToken}` } },
    { rating: 6 }
  );
  assert(rate6.status === 400, '26. Boundary: Rating 6 rejected (400)');

  const rateFloat = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1/ratings', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${normToken}` } },
    { rating: 3.5 }
  );
  assert(rateFloat.status === 400, '27. Boundary: Rating float 3.5 rejected (400)');

  // 8. Password Update Workflow
  const passUpdate = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/password', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${normToken}` } },
    { currentPassword: 'UserPass123!', newPassword: 'NewUserPass123!' }
  );
  assert(passUpdate.status === 200, '28. Password Update succeeds (200 OK)');

  const relogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: userEmail, password: 'NewUserPass123!' }
  );
  assert(relogin.status === 200 && relogin.body.data?.token, '29. Login with updated password succeeds');

  console.log('\n====================================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runMasterE2ETests().catch(console.error);
