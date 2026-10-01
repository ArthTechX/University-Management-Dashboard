const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function initDB() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    // Supabase requires SSL
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to the database...');
    
    // Read SQL files
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Execute Schema
    console.log('Executing schema.sql...');
    await pool.query(schemaSql);
    console.log('✅ Schema executed successfully.');

    // Execute Seed
    console.log('Executing seed.sql...');
    await pool.query(seedSql);
    console.log('✅ Seed data inserted successfully.');

    console.log('\n🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
  } finally {
    await pool.end();
  }
}

initDB();
