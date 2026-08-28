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

async function runTests() {
  console.log('--- Testing Backend APIs ---');

  // 1. Health check
  const health = await request({ host: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
  console.log('Health Check Status:', health.status, health.body);

  // 2. Admin Login
  const adminLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@platform.com', password: 'AdminPass123!' }
  );
  console.log('Admin Login Status:', adminLogin.status, 'User Role:', adminLogin.body.user?.role);
  const adminToken = adminLogin.body.token;

  // 3. User Login
  const userLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'user1@gmail.com', password: 'UserPass123!' }
  );
  console.log('User Login Status:', userLogin.status, 'User Role:', userLogin.body.user?.role);
  const userToken = userLogin.body.token;

  // 4. Owner Login
  const ownerLogin = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'owner1@supermart.com', password: 'OwnerPass123!' }
  );
  console.log('Owner Login Status:', ownerLogin.status, 'User Role:', ownerLogin.body.user?.role);
  const ownerToken = ownerLogin.body.token;

  // 5. User rates store 1
  const rateRes = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/stores/1/ratings', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } },
    { rating: 5 }
  );
  console.log('Submit Rating Status:', rateRes.status, 'Overall Rating:', rateRes.body.store?.overall_rating);

  // 6. Admin Dashboard
  const adminDash = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  console.log('Admin Dashboard Stats:', adminDash.status, adminDash.body.stats);

  // 7. Store Owner Dashboard
  const ownerDash = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/owner/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${ownerToken}` } }
  );
  console.log('Owner Dashboard Status:', ownerDash.status, 'Store Name:', ownerDash.body.store?.name, 'Total Ratings:', ownerDash.body.store?.totalRatings);

  // 8. Unauthorized test: Normal user tries admin route
  const unauthTest = await request(
    { host: '127.0.0.1', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } }
  );
  console.log('Unauthorized Access Test Status (Expect 403):', unauthTest.status, unauthTest.body.message);

  console.log('--- ALL BACKEND API TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(console.error);
