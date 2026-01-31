const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/db');

const fixDatabase = async () => {
    try {
        console.log("🔍 Checking Production Database Schema...");

        // 1. Check if 'locked_universities' table exists
        const tableCheck = await pool.query(
            "SELECT to_regclass('public.locked_universities')"
        );
        if (!tableCheck.rows[0].to_regclass) {
            console.error("❌ Critical: 'locked_universities' table does not exist!");
            return;
        }

        // 2. Check for 'status' column and add if missing
        try {
            await pool.query("SELECT status FROM locked_universities LIMIT 1");
            console.log("✅ 'status' column exists.");
        } catch (err) {
            console.log("⚠️ 'status' column missing. Adding it...");
            await pool.query("ALTER TABLE locked_universities ADD COLUMN status VARCHAR(50) DEFAULT 'Draft'");
            console.log("✅ Added 'status' column.");
        }

        // 3. Check for 'deadline' column and add if missing
        try {
            await pool.query("SELECT deadline FROM locked_universities LIMIT 1");
            console.log("✅ 'deadline' column exists.");
        } catch (err) {
            console.log("⚠️ 'deadline' column missing. Adding it...");
            await pool.query("ALTER TABLE locked_universities ADD COLUMN deadline TIMESTAMP WITH TIME ZONE");
            console.log("✅ Added 'deadline' column.");
        }

        // 4. Check for 'notes' column and add if missing
        try {
            await pool.query("SELECT notes FROM locked_universities LIMIT 1");
            console.log("✅ 'notes' column exists.");
        } catch (err) {
            console.log("⚠️ 'notes' column missing. Adding it...");
            await pool.query("ALTER TABLE locked_universities ADD COLUMN notes TEXT");
            console.log("✅ Added 'notes' column.");
        }

        // 5. Verify ID type of universities (should be acceptable for both int and string if we want to be safe, but actually it's VARCHAR now)
        // We won't change it here to avoid locking, verifying column existence is usually enough for the 500 error.

        console.log("🚀 Database repair completed successfully!");

    } catch (err) {
        console.error("❌ Database repair failed:", err);
    } finally {
        pool.end();
    }
};

fixDatabase();
