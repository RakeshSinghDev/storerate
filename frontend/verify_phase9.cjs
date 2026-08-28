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

async function runPhase9Tests() {
  console.log('==================================================');
  console.log('   VERIFYING PHASE 9 IMPLEMENTATION (NORMAL USER UX)');
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
  const user1Login = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'user1@gmail.com', password: 'UserPass123!' }
  );
  const user1Token = user1Login.body.data?.token;

  const adminLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  const adminToken = adminLogin.body.data?.token;

  assert(user1Token && adminToken, '1. Initial user & admin logins succeeded');

  // 2. GET /api/stores
  const storesRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(storesRes.status === 200 && Array.isArray(storesRes.body.data) && storesRes.body.pagination, '2. GET /api/stores returns store list with pagination', JSON.stringify(storesRes.body));

  // 3. Search by name
  const nameSearch = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?name=Apex', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(nameSearch.status === 200 && nameSearch.body.data?.length > 0, '3. Search stores by name (ILIKE)', JSON.stringify(nameSearch.body.data));

  // 4. Search by address
  const addrSearch = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?address=Retail', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(addrSearch.status === 200 && addrSearch.body.data?.length > 0, '4. Search stores by address (ILIKE)', JSON.stringify(addrSearch.body.data));

  // 5. Combined Search
  const combinedSearch = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?name=Apex&address=Retail', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(combinedSearch.status === 200 && combinedSearch.body.data?.length === 1, '5. Combined name & address search', JSON.stringify(combinedSearch.body.data));

  // 6. Sorting (name asc and averageRating desc)
  const sortName = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?sortBy=name&order=asc', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(sortName.status === 200 && sortName.body.data?.length > 0, '6. Sort stores by name ASC', JSON.stringify(sortName.body.data));

  const sortRating = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?sortBy=averageRating&order=desc', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(sortRating.status === 200, '7. Sort stores by averageRating DESC');

  // 7. Pagination
  const paginatedRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?page=1&limit=2', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(paginatedRes.status === 200 && paginatedRes.body.pagination?.limit === 2, '8. Store pagination metadata accurate');

  // 8. Store details
  const storeDetail = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(storeDetail.status === 200 && storeDetail.body.data?.id === 1, '9. GET /api/stores/1 returns store details', JSON.stringify(storeDetail.body.data));

  // Create clean store for rating tests
  const freshStoreRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Fresh UX Test Store', email: `fresh_${Date.now()}@store.com`, address: '500 UX Way' }
  );
  const freshStoreId = freshStoreRes.body.data?.id;

  // 10. Submit Rating 5
  const rate5Res = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${freshStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 5 }
  );
  assert(rate5Res.status === 201 && rate5Res.body.data?.rating === 5, '10. Submit 5-star rating succeeds (201 Created)', JSON.stringify(rate5Res.body));

  // 11. Duplicate Rating Submission Check
  const dupRateRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${freshStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 4 }
  );
  assert(dupRateRes.status === 409 && dupRateRes.body.message.includes('already submitted'), '11. Duplicate rating submission rejected with 409 Conflict', JSON.stringify(dupRateRes.body));

  // 12. Modify Rating to 3
  const modRateRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${freshStoreId}/ratings`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 3 }
  );
  assert(modRateRes.status === 200 && modRateRes.body.data?.rating === 3, '12. Modify rating to 3 stars succeeds (200 OK)', JSON.stringify(modRateRes.body));

  // 13. Rating Validation Checks (0, 6, 4.5)
  const rate0 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${freshStoreId}/ratings`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 0 }
  );
  assert(rate0.status === 400, '13. Rating 0 rejected (400)');

  const rateFloat = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${freshStoreId}/ratings`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 4.5 }
  );
  assert(rateFloat.status === 400, '14. Float rating 4.5 rejected (400)');

  // 15. Check My Rating
  const myRatingRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${freshStoreId}/ratings/me`, method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(myRatingRes.status === 200 && myRatingRes.body.data?.rating === 3, '15. GET /api/stores/:id/ratings/me returns rating 3', JSON.stringify(myRatingRes.body.data));

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase9Tests().catch(console.error);
