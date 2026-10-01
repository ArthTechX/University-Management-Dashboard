const { Pool } = require('pg');
require('dotenv').config();

async function migrateV2() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to the database for V2 migration...');
    
    const migrationSql = `
      -- 1. Announcements Table
      CREATE TABLE IF NOT EXISTS announcements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          created_by UUID NOT NULL REFERENCES users(id)
      );

      -- 2. Course Resources Table
      CREATE TABLE IF NOT EXISTS course_resources (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          storage_path TEXT NOT NULL,
          size_bytes BIGINT NOT NULL,
          uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          uploaded_by UUID NOT NULL REFERENCES users(id)
      );

      -- 3. Seed More Realistic Courses
      -- We find an admin user to assign as creator
      DO $$
      DECLARE 
        admin_id UUID;
      BEGIN
        SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
        
        IF admin_id IS NOT NULL THEN
          INSERT INTO courses (title, description, category, instructor_name, capacity, created_by)
          VALUES 
          ('Advanced Algorithms', 'Deep dive into graph algorithms, dynamic programming, and complexity theory.', 'Computer Science', 'Dr. Smith', 50, admin_id),
          ('Introduction to Philosophy', 'Exploring meaning, existence, and the fundamental nature of knowledge.', 'Humanities', 'Prof. Davis', NULL, admin_id),
          ('Data Science 101', 'Learn Python, pandas, and basic machine learning concepts for data analysis.', 'Data Science', 'Dr. Lee', 100, admin_id),
          ('Digital Marketing Strategies', 'Modern marketing in the digital age: SEO, SEM, and social media analytics.', 'Business', 'Prof. Miller', 75, admin_id)
          ON CONFLICT DO NOTHING;
        END IF;
      END $$;
    `;

    console.log('Executing V2 migration schema & seed...');
    await pool.query(migrationSql);
    console.log('✅ Migration V2 executed successfully.');

  } catch (err) {
    console.error('❌ Error in migration:', err.message);
  } finally {
    await pool.end();
  }
}

migrateV2();
