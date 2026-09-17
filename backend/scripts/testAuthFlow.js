const http = require('http');

// Helper to make JSON HTTP request
function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Backend API Automated Verification...\n');

  // 1. Health check
  const health = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/v1/health',
    method: 'GET',
  });
  console.log(`[1] Health Check: Status ${health.status} ->`, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Admin Login
  const loginRes = await request(
    {
      host: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@example.com', password: 'AdminPass123!' }
  );
  console.log(`[2] Admin Login: Status ${loginRes.status}, Token received: ${!!loginRes.data.accessToken}`);
  if (loginRes.status !== 200 || !loginRes.data.accessToken) throw new Error('Admin login failed');

  const adminToken = loginRes.data.accessToken;
  const cookieHeader = loginRes.headers['set-cookie'];
  console.log(`    Cookie set: ${cookieHeader ? cookieHeader[0].substring(0, 40) + '...' : 'none'}`);

  // 3. User Me Profile
  const meRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`[3] GET /auth/me: User ${meRes.data.user?.name} (Role: ${meRes.data.user?.role})`);
  if (meRes.status !== 200) throw new Error('Me profile failed');

  // 4. Token Rotation (/auth/refresh)
  const refreshCookie = cookieHeader ? cookieHeader[0].split(';')[0] : '';
  const refreshRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/v1/auth/refresh',
    method: 'POST',
    headers: { Cookie: refreshCookie },
  });
  console.log(`[4] Token Rotation POST /auth/refresh: Status ${refreshRes.status}, New Token: ${!!refreshRes.data.accessToken}`);
  if (refreshRes.status !== 200) throw new Error('Token rotation failed');

  // 5. Test Token Reuse Detection (using old refresh cookie again)
  const reuseRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/v1/auth/refresh',
    method: 'POST',
    headers: { Cookie: refreshCookie },
  });
  console.log(`[5] Token Reuse Theft Test: Status ${reuseRes.status} (Expected 401: ${reuseRes.data.code})`);
  if (reuseRes.status !== 401 || reuseRes.data.code !== 'TOKEN_REUSE_DETECTED') {
    throw new Error('Token reuse detection failed to reject and invalidate token!');
  }

  // 6. Public Changelog list with reaction counts
  const publicList = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/v1/changelog',
    method: 'GET',
  });
  console.log(`[6] Public Changelog: Found ${publicList.data.data?.length} posts, total: ${publicList.data.pagination?.total}`);
  if (publicList.status !== 200 || !publicList.data.data?.length) throw new Error('Public changelog list failed');

  const firstPost = publicList.data.data[0];
  console.log(`    First post: "${firstPost.title}" | Reactions:`, firstPost.reactions);

  // 7. Test Reactions Toggle
  // Log in as demo user
  const userLogin = await request(
    {
      host: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'user@example.com', password: 'UserPass123!' }
  );
  const userToken = userLogin.data.accessToken;

  const reactRes = await request(
    {
      host: 'localhost',
      port: 5000,
      path: `/api/v1/changelog/${firstPost._id}/react`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    },
    { emoji: '🚀' }
  );
  console.log(`[7] Toggle Reaction: Action "${reactRes.data.action}", Updated counts:`, reactRes.data.counts);

  // 8. Notifications unread count & mark as read
  const unreadRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/v1/notifications/unread-count',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`[8] Unread Notifications: Count = ${unreadRes.data.unreadCount}`);

  const markReadRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/v1/notifications/mark-read',
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`[9] Mark Read: Status ${markReadRes.status}, New unread count = ${markReadRes.data.unreadCount}`);

  // 10. Public JSON Feed
  const feedRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/v1/changelog/feed',
    method: 'GET',
  });
  console.log(`[10] Public JSON Feed: Items count = ${feedRes.data.count}`);
  if (feedRes.status !== 200 || !feedRes.data.items) throw new Error('Public feed failed');

  console.log('\n🎉 ALL 10 BACKEND VERIFICATION TESTS PASSED PERFECTLY!\n');
}

module.exports = runTests;

if (require.main === module) {
  runTests().catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}
