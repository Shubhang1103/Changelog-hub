const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('../src/server');
const runTests = require('./testAuthFlow');

const server = app.listen(5000, '127.0.0.1', async () => {
  console.log('[Test Server] Running on http://127.0.0.1:5000');
  try {
    await runTests();
    console.log('[Test Server] Testing complete. Shutting down gracefully.');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('[Test Server] Test failed:', err);
    server.close(() => process.exit(1));
  }
});
