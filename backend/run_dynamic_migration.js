const fs = require('fs');
const pool = require('./config/db');
const path = require('path');

const migrate = async () => {
    try {
        const sqlPath = path.join(__dirname, '../database/migration_dynamic_onboarding.sql');
        console.log(`Reading migration from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Executing migration...');
        await pool.query(sql);
        console.log("Migration successful");
    } catch (err) {
        console.error("Migration failed", err);
    } finally {
        pool.end();
    }
};
migrate();
