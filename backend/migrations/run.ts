import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📍 Connecting to: ${process.env.DB_HOST}/${process.env.DB_NAME}`);

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!\n');
    client.release();

    // Get all SQL files in migrations folder
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure order

    console.log(`Found ${files.length} migration files:\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`📄 Running: ${file}`);

      try {
        await pool.query(sql);
        console.log(`   ✅ Success\n`);
      } catch (error: any) {
        // Check if it's a "relation already exists" error
        if (error.code === '42P07') {
          console.log(`   ⚠️  Tables already exist (skipping)\n`);
        } else {
          console.error(`   ❌ Error: ${error.message}\n`);
          throw error;
        }
      }
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
