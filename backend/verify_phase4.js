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

async function runPhase4Tests() {
  console.log('==================================================');
  console.log('    VERIFYING PHASE 4 IMPLEMENTATION (ADMIN BACKEND)');
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

  // 1. Logins to fetch tokens
  const adminLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  const adminToken = adminLogin.body.data?.token;

  const userLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'user1@gmail.com', password: 'UserPass123!' }
  );
  const userToken = userLogin.body.data?.token;
  const normalUserId = userLogin.body.data?.user?.id;

  const ownerLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'owner1@supermart.com', password: 'OwnerPass123!' }
  );
  const ownerToken = ownerLogin.body.data?.token;
  const storeOwnerId = ownerLogin.body.data?.user?.id;

  // 2. Authorization Checks
  const userDashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } }
  );
  assert(userDashRes.status === 403, '1. Normal User blocked from GET /api/admin/dashboard (403)', JSON.stringify(userDashRes.body));

  const ownerDashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${ownerToken}` } }
  );
  assert(ownerDashRes.status === 403, '2. Store Owner blocked from GET /api/admin/dashboard (403)', JSON.stringify(ownerDashRes.body));

  const userCreateUserRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Authorization': `Bearer ${userToken}` } }
  );
  assert(userCreateUserRes.status === 403, '3. Normal User blocked from POST /api/admin/users (403)', JSON.stringify(userCreateUserRes.body));

  const ownerCreateStoreRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Authorization': `Bearer ${ownerToken}` } }
  );
  assert(ownerCreateStoreRes.status === 403, '4. Store Owner blocked from POST /api/admin/stores (403)', JSON.stringify(ownerCreateStoreRes.body));

  // 3. Admin Dashboard Stats
  const adminDashRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(
    adminDashRes.status === 200 &&
    typeof adminDashRes.body.data?.totalUsers === 'number' &&
    typeof adminDashRes.body.data?.totalStores === 'number' &&
    typeof adminDashRes.body.data?.totalRatings === 'number',
    '5. Admin Dashboard returns totalUsers, totalStores, and totalRatings (200)',
    JSON.stringify(adminDashRes.body)
  );

  // 4. Admin Create Users (All 3 roles)
  const newNormalUser = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Admin Created Normal User Full Name', email: `admin_norm_${Date.now()}@test.com`, address: '101 Admin Created St', password: 'UserPass123!', role: 'NORMAL_USER' }
  );
  assert(newNormalUser.status === 201 && newNormalUser.body.data?.role === 'NORMAL_USER', '6. Admin can create NORMAL_USER (201)', JSON.stringify(newNormalUser.body));

  const newOwnerUser = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Admin Created Store Owner Full Name', email: `admin_owner_${Date.now()}@test.com`, address: '102 Admin Created St', password: 'OwnerPass123!', role: 'STORE_OWNER' }
  );
  assert(newOwnerUser.status === 201 && newOwnerUser.body.data?.role === 'STORE_OWNER', '7. Admin can create STORE_OWNER (201)', JSON.stringify(newOwnerUser.body));
  const newCreatedOwnerId = newOwnerUser.body.data?.id;

  const newAdminUser = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Admin Created System Admin Account Name', email: `admin_sys_${Date.now()}@test.com`, address: '103 Admin Created St', password: 'AdminPass123!', role: 'SYSTEM_ADMINISTRATOR' }
  );
  assert(newAdminUser.status === 201 && newAdminUser.body.data?.role === 'SYSTEM_ADMINISTRATOR', '8. Admin can create SYSTEM_ADMINISTRATOR (201)', JSON.stringify(newAdminUser.body));

  // 5. Admin Create Store Validation Tests
  const validStoreRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Grand Central Market', email: `market_${Date.now()}@store.com`, address: '555 Commerce Way', ownerId: newCreatedOwnerId }
  );
  assert(validStoreRes.status === 201 && validStoreRes.body.data?.ownerId === newCreatedOwnerId, '9. Admin can create store assigned to valid STORE_OWNER (201)', JSON.stringify(validStoreRes.body));

  const invalidOwnerStoreRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Invalid Owner Store', email: `invalid_${Date.now()}@store.com`, address: '555 Commerce Way', ownerId: normalUserId }
  );
  assert(invalidOwnerStoreRes.status === 400 && invalidOwnerStoreRes.body.message.includes('STORE_OWNER'), '10. Store creation with NORMAL_USER as owner rejected (400)', JSON.stringify(invalidOwnerStoreRes.body));

  const nonExistentOwnerRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Nonexistent Owner Store', email: `nonexist_${Date.now()}@store.com`, address: '555 Commerce Way', ownerId: 999999 }
  );
  assert(nonExistentOwnerRes.status === 400 && nonExistentOwnerRes.body.message.includes('does not exist'), '11. Store creation with non-existent owner ID rejected (400)', JSON.stringify(nonExistentOwnerRes.body));

  // 6. User Listing Filtering, Sorting, & Pagination
  const defaultUsersRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  const defaultRoles = defaultUsersRes.body.data?.map(u => u.role) || [];
  assert(defaultUsersRes.status === 200 && defaultRoles.every(r => r === 'NORMAL_USER' || r === 'SYSTEM_ADMINISTRATOR'), '12. GET /api/admin/users default filter excludes STORE_OWNER', JSON.stringify(defaultRoles));

  const ownerUsersRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users?role=STORE_OWNER', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(ownerUsersRes.status === 200 && ownerUsersRes.body.data?.every(u => u.role === 'STORE_OWNER'), '13. GET /api/admin/users?role=STORE_OWNER returns only store owners', JSON.stringify(ownerUsersRes.body.data));

  const paginatedUsersRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users?page=1&limit=2&sortBy=name&order=asc', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(paginatedUsersRes.status === 200 && paginatedUsersRes.body.pagination?.limit === 2 && paginatedUsersRes.body.pagination?.page === 1, '14. GET /api/admin/users pagination metadata accurate', JSON.stringify(paginatedUsersRes.body.pagination));

  // 7. User Details (GET /api/admin/users/:id)
  const ownerDetailRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/admin/users/${storeOwnerId}`, method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(ownerDetailRes.status === 200 && ownerDetailRes.body.data?.store !== null && typeof ownerDetailRes.body.data?.store?.name === 'string', '15. GET /api/admin/users/:id for STORE_OWNER includes store details and ratings', JSON.stringify(ownerDetailRes.body.data));

  const normalUserDetailRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/admin/users/${normalUserId}`, method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(normalUserDetailRes.status === 200 && normalUserDetailRes.body.data?.store === null, '16. GET /api/admin/users/:id for NORMAL_USER returns store: null', JSON.stringify(normalUserDetailRes.body.data));

  // 8. Store Listing (GET /api/admin/stores)
  const storesRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores?sortBy=averageRating&order=desc', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(storesRes.status === 200 && Array.isArray(storesRes.body.data) && storesRes.body.pagination, '17. GET /api/admin/stores returns store aggregates with averageRating and ratingCount', JSON.stringify(storesRes.body.data));

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase4Tests().catch(console.error);
