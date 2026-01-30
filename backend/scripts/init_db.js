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

    } catch (err) {
        console.error("Database initialization failed:", err);
    } finally {
        pool.end();
    }
};

initDb();
