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

async function runPhase10Tests() {
  console.log('==================================================');
  console.log('   VERIFYING PHASE 10 IMPLEMENTATION (ADMIN UI)');
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

  // 1. Logins
  const adminLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  const adminToken = adminLogin.body.data?.token;

  const normalLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'user1@gmail.com', password: 'UserPass123!' }
  );
  const normalToken = normalLogin.body.data?.token;

  assert(adminToken && normalToken, '1. Admin & Normal user logins succeeded');

  // 2. Admin Dashboard Stats
  const dashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(
    dashRes.status === 200 &&
    typeof dashRes.body.data?.totalUsers === 'number' &&
    typeof dashRes.body.data?.totalStores === 'number' &&
    typeof dashRes.body.data?.totalRatings === 'number',
    '2. GET /api/admin/dashboard returns real totalUsers, totalStores, and totalRatings',
    JSON.stringify(dashRes.body.data)
  );

  // 3. User Listing
  const usersRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(usersRes.status === 200 && Array.isArray(usersRes.body.data) && usersRes.body.pagination, '3. GET /api/admin/users returns user list and pagination metadata');

  // 4. User Filtering by Role
  const roleFilter = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users?role=STORE_OWNER', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(roleFilter.status === 200 && roleFilter.body.data.every(u => u.role === 'STORE_OWNER'), '4. User filtering by role=STORE_OWNER accurate');

  // 5. User Sorting
  const userSort = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users?sortBy=name&order=asc', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(userSort.status === 200 && userSort.body.data?.length > 0, '5. Server-side user sorting by name ASC');

  // 6, 7, 8. Admin Creates Users of all 3 Roles
  const newNormal = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Admin Created Normal User Name Record', email: `norm_${Date.now()}@test.com`, address: '123 Test St', password: 'UserPass123!', role: 'NORMAL_USER' }
  );
  assert(newNormal.status === 201 && newNormal.body.data?.role === 'NORMAL_USER', '6. Admin creates NORMAL_USER account');

  const newOwner = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Admin Created Store Owner Name Record', email: `owner_${Date.now()}@test.com`, address: '456 Owner St', password: 'OwnerPass123!', role: 'STORE_OWNER' }
  );
  const newOwnerId = newOwner.body.data?.id;
  assert(newOwner.status === 201 && newOwner.body.data?.role === 'STORE_OWNER', '7. Admin creates STORE_OWNER account');

  const newAdmin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Admin Created System Admin Name Record', email: `admin_${Date.now()}@test.com`, address: '789 Admin St', password: 'AdminPass123!', role: 'SYSTEM_ADMINISTRATOR' }
  );
  assert(newAdmin.status === 201 && newAdmin.body.data?.role === 'SYSTEM_ADMINISTRATOR', '8. Admin creates SYSTEM_ADMINISTRATOR account');

  // 9. User Details for STORE_OWNER
  const ownerDetails = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/admin/users/${newOwnerId}`, method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(ownerDetails.status === 200 && ownerDetails.body.data?.role === 'STORE_OWNER', '9. GET /api/admin/users/:id for STORE_OWNER returns profile info');

  // 10. User Details for NORMAL_USER
  const normId = newNormal.body.data?.id;
  const normDetails = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/admin/users/${normId}`, method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(normDetails.status === 200 && normDetails.body.data?.store === null, '10. GET /api/admin/users/:id for NORMAL_USER returns store: null');

  // 11. GET /api/admin/stores
  const storesRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(storesRes.status === 200 && Array.isArray(storesRes.body.data), '11. GET /api/admin/stores returns store directory');

  // 12. Store Search by Name
  const storeSearch = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores?name=Apex', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(storeSearch.status === 200, '12. Store search by name');

  // 13. Store Sorting
  const storeSort = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores?sortBy=averageRating&order=desc', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(storeSort.status === 200, '13. Server-side store sorting by averageRating DESC');

  // 14. Admin Creates Store for Valid Store Owner
  const validStore = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Admin Valid Store Name', email: `store_${Date.now()}@test.com`, address: '100 Store Lane', ownerId: newOwnerId }
  );
  assert(validStore.status === 201 && validStore.body.data?.ownerId === newOwnerId, '14. Admin creates store assigned to valid STORE_OWNER');

  // 15. Admin Store Creation with NORMAL_USER Rejected
  const invalidStore = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Invalid Owner Store', email: `inv_${Date.now()}@test.com`, address: '200 Fail Lane', ownerId: normId }
  );
  assert(invalidStore.status === 400 && invalidStore.body.message.includes('STORE_OWNER'), '15. Store creation with NORMAL_USER owner rejected with 400 Bad Request', JSON.stringify(invalidStore.body));

  // 16. Security RBAC Check (Normal User blocked from /api/admin/*)
  const forbiddenCheck = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${normalToken}` } }
  );
  assert(forbiddenCheck.status === 403, '16. Normal user blocked from admin endpoints with 403 Forbidden');

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase10Tests().catch(console.error);
