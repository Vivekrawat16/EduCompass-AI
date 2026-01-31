const fs = require('fs');
const pool = require('../config/db');
const path = require('path');

const applyMigrations = async () => {
    try {
        console.log("Starting Production Migrations...");

        // 1. Apply University ID Fix (Integer -> VARCHAR)
        try {
            const idFixPath = path.join(__dirname, '../../database/migration_fix_university_ids.sql');
            if (fs.existsSync(idFixPath)) {
                console.log('Applying ID Fix migration...');
                const idFixSql = fs.readFileSync(idFixPath, 'utf8');
                await pool.query(idFixSql);
                console.log("✅ ID Fix migration applied!");
            }
        } catch (e) {
            console.warn("⚠️ ID Fix skipped (likely already applied):", e.message);
        }

        // 2. Add Application Tracking Fields (Status, Deadline, Notes)
        try {
            const appFieldsPath = path.join(__dirname, '../../database/migration_add_application_fields.sql');
            if (fs.existsSync(appFieldsPath)) {
                console.log('Applying Application Fields migration...');
                const appFieldsSql = fs.readFileSync(appFieldsPath, 'utf8');
                await pool.query(appFieldsSql);
                console.log("✅ Application Fields migration applied!");
            }
        } catch (e) {
            console.warn("⚠️ Application Fields migration skipped:", e.message);
        }

        // 3. Google Auth Migration (if needed)
        const authMigrationPath = path.join(__dirname, '../../database/migration_google_auth.sql');
        if (fs.existsSync(authMigrationPath)) {

            console.log("🚀 All migrations completed successfully!");

        } catch (err) {
            console.error("❌ Migration failed:", err);
        } finally {
            pool.end();
        }
    };

    applyMigrations();
