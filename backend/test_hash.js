const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function fixLogin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash('admin123', salt);
    
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, 'admin@edutrack.edu']);
    console.log('Successfully updated password to admin123!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
fixLogin();
