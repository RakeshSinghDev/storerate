const app = require('./app');
const { testConnection } = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Fail clearly if database connection cannot be established
    await testConnection();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend server successfully running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup aborted due to database connection failure.');
    process.exit(1);
  }
}

startServer();
