const fs = require('fs');
const pool = require('../config/db');
const path = require('path');

const runFix = async () => {
    try {
        const idFixPath = path.join(__dirname, '../../database/migration_fix_university_ids.sql');
        console.log('Applying ID Fix migration (VARCHAR IDs)...');
        const idFixSql = fs.readFileSync(idFixPath, 'utf8');
        await pool.query(idFixSql);
        console.log("ID Fix migration applied successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
};

runFix();
