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

async function runFullE2ETestSuite() {
  console.log('==================================================');
  console.log('     STARTING FULL E2E COMPREHENSIVE SUITE');
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

  // Test 1: Name below 20 chars
  const res1 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Short Name', email: 'shortname@test.com', address: '123 Test St', password: 'Password123!' }
  );
  assert(res1.status === 400, 'Test 1: Name below 20 characters rejected', JSON.stringify(res1.body));

  // Test 2: Name above 60 chars
  const longName = 'A'.repeat(61);
  const res2 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: longName, email: 'longname@test.com', address: '123 Test St', password: 'Password123!' }
  );
  assert(res2.status === 400, 'Test 2: Name above 60 characters rejected', JSON.stringify(res2.body));

  // Test 3: Address above 400 chars
  const longAddress = 'B'.repeat(401);
  const res3 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid User Name Example Person Test', email: 'longaddr@test.com', address: longAddress, password: 'Password123!' }
  );
  assert(res3.status === 400, 'Test 3: Address above 400 characters rejected', JSON.stringify(res3.body));

  // Test 4: Invalid Password (no special char)
  const res4 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid User Name Example Person Test', email: 'nospec@test.com', address: '123 Street', password: 'Password123' }
  );
  assert(res4.status === 400, 'Test 4: Password without special character rejected', JSON.stringify(res4.body));

  // Test 5: Invalid Email format
  const res5 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Valid User Name Example Person Test', email: 'invalid-email-format', address: '123 Street', password: 'Password123!' }
  );
  assert(res5.status === 400, 'Test 5: Invalid email format rejected', JSON.stringify(res5.body));

  // Test 6: Valid Normal User Registration
  const testEmail = `e2e_user_${Date.now()}@test.com`;
  const res6 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'E2E Registered Normal User Account Name', email: testEmail, address: '456 Integration Highway', password: 'UserPass123!' }
  );
  assert(res6.status === 201 && res6.body.token, 'Test 6: Valid Normal User Registration succeeds', JSON.stringify(res6.body));
  const userToken = res6.body.token;

  // Test 7: Duplicate Email Registration attempt
  const res7 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'E2E Registered Normal User Account Name', email: testEmail, address: '456 Integration Highway', password: 'UserPass123!' }
  );
  assert(res7.status === 400, 'Test 7: Duplicate email registration rejected', JSON.stringify(res7.body));

  // Test 8: Login with Incorrect Password
  const res8 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: testEmail, password: 'WrongPassword123!' }
  );
  assert(res8.status === 401, 'Test 8: Incorrect password login rejected', JSON.stringify(res8.body));

  // Test 9: Login with Correct Password
  const res9 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: testEmail, password: 'UserPass123!' }
  );
  assert(res9.status === 200 && res9.body.user.email === testEmail, 'Test 9: Correct password login succeeds', JSON.stringify(res9.body));

  // Test 10: Admin Login
  const res10 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  assert(res10.status === 200 && res10.body.user.role === 'SYSTEM_ADMINISTRATOR', 'Test 10: Admin login succeeds', JSON.stringify(res10.body));
  const adminToken = res10.body.token;

  // Test 11: Store Owner Login
  const res11 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'owner1@supermart.com', password: 'OwnerPass123!' }
  );
  assert(res11.status === 200 && res11.body.user.role === 'STORE_OWNER', 'Test 11: Store Owner login succeeds', JSON.stringify(res11.body));
  const ownerToken = res11.body.token;

  // Test 12: Unauthorized Access (Normal user -> Admin route)
  const res12 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } }
  );
  assert(res12.status === 403, 'Test 12: Normal user blocked from Admin endpoint (403)', JSON.stringify(res12.body));

  // Test 13: Unauthorized Access (Store owner -> Admin route)
  const res13 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${ownerToken}` } }
  );
  assert(res13.status === 403, 'Test 13: Store owner blocked from Admin endpoint (403)', JSON.stringify(res13.body));

  // Test 14: Store Creation by Admin
  const newStoreEmail = `newstore_${Date.now()}@store.com`;
  const res14 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Fresh Organic Market', email: newStoreEmail, address: '888 Green Valley Way' }
  );
  assert(res14.status === 201 && res14.body.store.id, 'Test 14: Admin can create new store', JSON.stringify(res14.body));
  const createdStoreId = res14.body.store.id;

  // Test 15: Admin creates a new User
  const adminCreatedEmail = `admin_created_${Date.now()}@test.com`;
  const res15 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/users', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Admin Created Store Owner Full Name', email: adminCreatedEmail, address: '999 Admin Created Rd', password: 'OwnerPass123!', role: 'STORE_OWNER' }
  );
  assert(res15.status === 201 && res15.body.user.role === 'STORE_OWNER', 'Test 15: Admin can create Store Owner user', JSON.stringify(res15.body));

  // Test 16: Search Stores by Name
  const res16 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?search=Organic', method: 'GET' }
  );
  assert(res16.status === 200 && res16.body.stores.length > 0 && res16.body.stores[0].name.includes('Organic'), 'Test 16: Search stores by name', JSON.stringify(res16.body));

  // Test 17: Submit Rating 5
  const res17 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${createdStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } },
    { rating: 5 }
  );
  assert(res17.status === 200 && res17.body.rating.rating === 5, 'Test 17: Submit rating 5 stars', JSON.stringify(res17.body));

  // Test 18: Reject Rating < 1 or > 5
  const res18 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${createdStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } },
    { rating: 6 }
  );
  assert(res18.status === 400, 'Test 18: Rating above 5 rejected', JSON.stringify(res18.body));

  // Test 19: Modify existing rating (Upsert constraint test)
  const res19 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${createdStoreId}/ratings`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } },
    { rating: 4 }
  );
  assert(res19.status === 200 && res19.body.rating.rating === 4, 'Test 19: Modify existing rating updates record instead of creating duplicate', JSON.stringify(res19.body));

  // Test 20: Verify Average Rating calculation
  const res20 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${createdStoreId}`, method: 'GET' }
  );
  assert(res20.status === 200 && res20.body.store.overall_rating === 4.0, 'Test 20: Average rating calculation accurate', JSON.stringify(res20.body));

  // Test 21: Admin filtering and sorting
  const res21 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/users?role=STORE_OWNER&sortBy=name&sortOrder=DESC', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  assert(res21.status === 200 && res21.body.users.every(u => u.role === 'STORE_OWNER'), 'Test 21: Admin filtering and sorting works', JSON.stringify(res21.body));

  // Test 22: User Password Update
  const res22 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/password', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } },
    { oldPassword: 'UserPass123!', newPassword: 'NewUserPass123!' }
  );
  assert(res22.status === 200, 'Test 22: User password update succeeds', JSON.stringify(res22.body));

  // Test 23: Login with updated password
  const res23 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: testEmail, password: 'NewUserPass123!' }
  );
  assert(res23.status === 200, 'Test 23: Login with updated password succeeds', JSON.stringify(res23.body));

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
}

runFullE2ETestSuite().catch(console.error);
