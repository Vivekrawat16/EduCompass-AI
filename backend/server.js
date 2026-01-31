const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

// Test DB Connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully:', res.rows[0].now);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
