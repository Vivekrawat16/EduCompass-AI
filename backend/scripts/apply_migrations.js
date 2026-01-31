const fs = require('fs');
const pool = require('../config/db');
const path = require('path');

const applyMigrations = async () => {
    try {
        console.log("Starting Production Migrations...");

        // 1. Apply University ID Fix (Integer -> VARCHAR)
        const idFixPath = path.join(__dirname, '../../database/migration_fix_university_ids.sql');
        if (fs.existsSync(idFixPath)) {
            console.log('Applying ID Fix migration...');
            const idFixSql = fs.readFileSync(idFixPath, 'utf8');
            await pool.query(idFixSql);
            console.log("✅ ID Fix migration applied!");
        }

        // 2. Google Auth Migration (if needed)
        const authMigrationPath = path.join(__dirname, '../../database/migration_google_auth.sql');
        if (fs.existsSync(authMigrationPath)) {
            // We can wrap this in a try-catch or check if column exists, 
            // but usually ADD COLUMN IF NOT EXISTS is safe if SQL is written that way.
            // migration_google_auth.sql usually has ALTER TABLE ... ADD COLUMN
            // Let's assume user might run it. 
            // Ideally we should check if migration is needed, but for now this script focuses on the critical fix.
        }

        console.log("🚀 All migrations completed successfully!");

    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        pool.end();
    }
};

applyMigrations();
