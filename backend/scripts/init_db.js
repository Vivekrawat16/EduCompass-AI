const fs = require('fs');
const pool = require('../config/db');
const path = require('path');

const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        console.log(`Reading schema from: ${schemaPath}`);
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await pool.query(sql);
        console.log("Schema applied successfully!");

        // Also run Google Auth migration if needed
        const authMigrationPath = path.join(__dirname, '../../database/migration_google_auth.sql');
        if (fs.existsSync(authMigrationPath)) {
            console.log('Applying Google Auth migration...');
            const authSql = fs.readFileSync(authMigrationPath, 'utf8');
            await pool.query(authSql);
            console.log("Google Auth migration applied!");
        }

        // Run Complete Profile migration (Fixes 500 error in Onboarding)
        const profileMigrationPath = path.join(__dirname, '../../database/migration_complete_profile.sql');
        if (fs.existsSync(profileMigrationPath)) {
            console.log('Applying Complete Profile migration...');
            const profileSql = fs.readFileSync(profileMigrationPath, 'utf8');
            await pool.query(profileSql);
            console.log("Complete Profile migration applied!");
        }

        // Run ID Fix migration (Fixes 500 error in Lock - String IDs)
        const idFixPath = path.join(__dirname, '../../database/migration_fix_university_ids.sql');
        if (fs.existsSync(idFixPath)) {
            console.log('Applying ID Fix migration (VARCHAR IDs)...');
            const idFixSql = fs.readFileSync(idFixPath, 'utf8');
            await pool.query(idFixSql);
            console.log("ID Fix migration applied!");
        }

    } catch (err) {
        console.error("Database initialization failed:", err);
    } finally {
        pool.end();
    }
};

initDb();
