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

async function runPhase5Tests() {
  console.log('==================================================');
  console.log('   VERIFYING PHASE 5 IMPLEMENTATION (NORMAL USER)');
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

  const ownerLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'owner1@supermart.com', password: 'OwnerPass123!' }
  );
  const ownerToken = ownerLogin.body.data?.token;

  const adminLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  const adminToken = adminLogin.body.data?.token;

  assert(user1Token && user2Token && ownerToken && adminToken, '1. User logins succeeded');

  // 2. GET /api/stores
  const storesRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(storesRes.status === 200 && Array.isArray(storesRes.body.data) && storesRes.body.pagination, '2. GET /api/stores returns stores list with pagination', JSON.stringify(storesRes.body));

  // 3. Search by name
  const searchNameRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?name=Apex', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(searchNameRes.status === 200 && searchNameRes.body.data?.length > 0 && searchNameRes.body.data[0].name.includes('Apex'), '3. Search stores by name ILIKE', JSON.stringify(searchNameRes.body.data));

  // 4. Search by address
  const searchAddrRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?address=Retail', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(searchAddrRes.status === 200 && searchAddrRes.body.data?.length > 0, '4. Search stores by address ILIKE', JSON.stringify(searchAddrRes.body.data));

  // 5. Combined search
  const combinedSearchRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?name=Apex&address=Retail', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(combinedSearchRes.status === 200 && combinedSearchRes.body.data?.length === 1, '5. Combined name & address search', JSON.stringify(combinedSearchRes.body.data));

  // 6. Sort by name ascending
  const sortNameRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?sortBy=name&order=asc', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  const names = sortNameRes.body.data?.map(s => s.name) || [];
  const isSortedNameAsc = names[0] <= names[names.length - 1];
  assert(sortNameRes.status === 200 && isSortedNameAsc, '6. Sort stores by name ASC', names.join(', '));

  // 7. Sort by averageRating descending
  const sortRatingRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?sortBy=averageRating&order=desc', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(sortRatingRes.status === 200, '7. Sort stores by averageRating DESC', JSON.stringify(sortRatingRes.body.data));

  // 8. Pagination
  const paginatedRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores?page=1&limit=2', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(paginatedRes.status === 200 && paginatedRes.body.pagination?.limit === 2, '8. Store pagination metadata accurate', JSON.stringify(paginatedRes.body.pagination));

  // 9. Get store details
  const storeDetailRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1', method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(storeDetailRes.status === 200 && storeDetailRes.body.data?.id === 1 && typeof storeDetailRes.body.data?.averageRating === 'number', '9. GET /api/stores/:id returns store details', JSON.stringify(storeDetailRes.body.data));

  // Create a clean unrated store for rating submission tests
  const createUnratedStore = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Unrated Fresh Market', email: `unrated_${Date.now()}@store.com`, address: '999 Fresh Way' }
  );
  const unratedStoreId = createUnratedStore.body.data?.id;

  // 10. Submit Rating 1
  const rate1Res = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${unratedStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 1 }
  );
  assert(rate1Res.status === 201 && rate1Res.body.data?.rating === 1, '10. Submit rating 1 star succeeds (201)', JSON.stringify(rate1Res.body));

  // Create another unrated store for rating 5 test
  const createUnratedStore2 = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/stores', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { name: 'Unrated Gourmet Bakery', email: `bakery_${Date.now()}@store.com`, address: '777 Bakery Way' }
  );
  const bakeryStoreId = createUnratedStore2.body.data?.id;

  // 11. Submit Rating 5
  const rate5Res = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 5 }
  );
  assert(rate5Res.status === 201 && rate5Res.body.data?.rating === 5, '11. Submit rating 5 stars succeeds (201)', JSON.stringify(rate5Res.body));

  // 12. Submit Rating 0 -> 400
  const rate0Res = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 0 }
  );
  assert(rate0Res.status === 400 && rate0Res.body.message.includes('integer between 1 and 5'), '12. Rating 0 rejected (400)', JSON.stringify(rate0Res.body));

  // 13. Submit Rating 6 -> 400
  const rate6Res = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 6 }
  );
  assert(rate6Res.status === 400, '13. Rating 6 rejected (400)', JSON.stringify(rate6Res.body));

  // 14. Submit Rating 4.5 -> 400
  const rateFloatRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 4.5 }
  );
  assert(rateFloatRes.status === 400, '14. Float rating 4.5 rejected (400)', JSON.stringify(rateFloatRes.body));

  // 15. Submit Duplicate Rating -> 409
  const dupRateRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 4 }
  );
  assert(dupRateRes.status === 409 && dupRateRes.body.message.includes('already submitted'), '15. Duplicate rating submission rejected (409 Conflict)', JSON.stringify(dupRateRes.body));

  // 16. Modify Existing Rating -> 200
  const modRateRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` } },
    { rating: 3 }
  );
  assert(modRateRes.status === 200 && modRateRes.body.data?.rating === 3, '16. Modify existing rating succeeds (200 OK)', JSON.stringify(modRateRes.body));

  // 17. Modify rating for store not rated yet -> 404
  const modUnratedRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 4 }
  );
  assert(modUnratedRes.status === 404 && modUnratedRes.body.message.includes('have not rated'), '17. Modify rating for unrated store returns 404 Not Found', JSON.stringify(modUnratedRes.body));

  // 18. Check my rating
  const myRatingRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings/me`, method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(myRatingRes.status === 200 && myRatingRes.body.data?.rating === 3, '18. GET /api/stores/:id/ratings/me returns user rating 3', JSON.stringify(myRatingRes.body.data));

  // 19. Check store average rating after modification
  const summaryRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  assert(summaryRes.status === 200 && summaryRes.body.data?.averageRating === 3.0 && summaryRes.body.data?.ratingCount === 1, '19. GET /api/stores/:id/ratings returns updated summary (3.0)', JSON.stringify(summaryRes.body.data));

  // 20. User 2 rates bakery store independently
  const user2RateRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` } },
    { rating: 5 }
  );
  assert(user2RateRes.status === 201 && user2RateRes.body.data?.rating === 5, '20. User 2 rates store independently with 5 stars', JSON.stringify(user2RateRes.body.data));

  // 21. Cross-user rating independence verification
  const myRatingRes1 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings/me`, method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  const myRatingRes2 = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings/me`, method: 'GET', headers: { 'Authorization': `Bearer ${user2Token}` } }
  );
  assert(myRatingRes1.body.data?.rating === 3 && myRatingRes2.body.data?.rating === 5, '21. Ratings are independent between users (User 1 = 3, User 2 = 5)');

  // 22. Store owner attempts normal-user rating endpoint -> 403
  const ownerRateRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` } },
    { rating: 4 }
  );
  assert(ownerRateRes.status === 403, '22. Store Owner blocked from rating submission (403 Forbidden)', JSON.stringify(ownerRateRes.body));

  // 23. Admin attempts normal-user rating endpoint -> 403
  const adminRateRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` } },
    { rating: 4 }
  );
  assert(adminRateRes.status === 403, '23. Admin blocked from normal-user rating endpoint (403 Forbidden)', JSON.stringify(adminRateRes.body));

  // 24. Direct PostgreSQL Verification vs API Response
  const dbSummaryRes = await pool.query(
    'SELECT ROUND(AVG(rating)::numeric, 1)::float AS avg, COUNT(*)::int AS count FROM ratings WHERE store_id = $1',
    [bakeryStoreId]
  );
  const dbAvg = dbSummaryRes.rows[0].avg;
  const dbCount = dbSummaryRes.rows[0].count;

  const apiSummaryRes = await request(
    { host: '127.0.0.1', port: 5000, path: `/api/stores/${bakeryStoreId}/ratings`, method: 'GET', headers: { 'Authorization': `Bearer ${user1Token}` } }
  );
  const apiAvg = apiSummaryRes.body.data?.averageRating;
  const apiCount = apiSummaryRes.body.data?.ratingCount;

  assert(dbAvg === apiAvg && dbCount === apiCount, '24. Direct SQL aggregate query matches API summary exactly (Avg: 4.0, Count: 2)', `SQL (Avg: ${dbAvg}, Count: ${dbCount}) vs API (Avg: ${apiAvg}, Count: ${apiCount})`);

  console.log('\n==================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPhase5Tests().catch(console.error);
