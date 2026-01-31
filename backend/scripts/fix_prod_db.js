const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/db');

const fixDatabase = async () => {
    try {
        console.log("�️ Starting Comprehensive Database Repair...");

        // 1. Fix 'universities' table ID type (Integer -> VARCHAR)
        // We do this first so FKs work correctly
        try {
            console.log("🔍 Checking 'universities' ID type...");
            const typeCheck = await pool.query(`
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'universities' AND column_name = 'id'
            `);

            if (typeCheck.rows.length > 0 && typeCheck.rows[0].data_type === 'integer') {
                console.log("⚠️ 'universities.id' is INTEGER. Converting to VARCHAR...");
                // Drop FKs first
                await pool.query("ALTER TABLE shortlists DROP CONSTRAINT IF EXISTS shortlists_university_id_fkey");
                await pool.query("ALTER TABLE locked_universities DROP CONSTRAINT IF EXISTS locked_universities_university_id_fkey");

                // Alter types
                await pool.query("ALTER TABLE universities ALTER COLUMN id TYPE VARCHAR(255)");
                await pool.query("ALTER TABLE shortlists ALTER COLUMN university_id TYPE VARCHAR(255)");
                // We handle locked_universities creation next, so we can ignore its alter if it doesn't exist
                try {
                    await pool.query("ALTER TABLE locked_universities ALTER COLUMN university_id TYPE VARCHAR(255)");
                } catch (e) { } // Ignore if table missing

                // Re-add shortlists FK
                await pool.query("ALTER TABLE shortlists ADD CONSTRAINT shortlists_university_id_fkey FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE");
                console.log("✅ Converted University IDs to VARCHAR.");
            } else {
                console.log("✅ 'universities.id' is already correct type.");
            }
        } catch (err) {
            console.error("❌ Failed checking/fixing University ID:", err.message);
        }

        // 2. Create 'locked_universities' table if missing
        try {
            console.log("🔍 Checking 'locked_universities' table...");
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS locked_universities (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    university_id VARCHAR(255) REFERENCES universities(id) ON DELETE CASCADE,
                    status VARCHAR(50) DEFAULT 'Draft',
                    deadline TIMESTAMP WITH TIME ZONE,
                    notes TEXT,
                    locked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await pool.query(createTableQuery);
            console.log("✅ Verified 'locked_universities' table exists.");
        } catch (err) {
            console.error("❌ Failed creating 'locked_universities':", err.message);
        }

        // 3. Add missing columns (if table existed but was old)
        const columnsToAdd = [
            { name: 'status', type: "VARCHAR(50) DEFAULT 'Draft'" },
            { name: 'deadline', type: "TIMESTAMP WITH TIME ZONE" },
            { name: 'notes', type: "TEXT" }
        ];

        for (const col of columnsToAdd) {
            try {
                await pool.query(`ALTER TABLE locked_universities ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`✅ Verified column '${col.name}'.`);
            } catch (err) {
                console.error(`⚠️ Error checking column '${col.name}':`, err.message);
            }
        }

        // 4. Ensure FK exists for locked_universities if it was just created or existed
        try {
            // Re-adding constraint safely? 
            // Postgres doesn't have "ADD CONSTRAINT IF NOT EXISTS".
            // We'll trust the CREATE TABLE or previous alteration.
            // But if it existed as INTEGER and we modified universities to VARCHAR, we need to ensure FK matches.
            // Let's force re-add constraint just in case it's missing (it fails if exists usually, so check first)

            // Check if constraint exists
            const constraintCheck = await pool.query(`
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'locked_universities' AND constraint_name = 'locked_universities_university_id_fkey'
            `);

            if (constraintCheck.rows.length === 0) {
                await pool.query("ALTER TABLE locked_universities ADD CONSTRAINT locked_universities_university_id_fkey FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE");
                console.log("✅ Restored Foreign Key for locked_universities.");
            }
        } catch (e) {
            // Ignore constraint already exists errors
        }

        console.log("🚀 Database repair completed successfully!");

    } catch (err) {
        console.error("❌ Fatal Error:", err);
    } finally {
        pool.end();
    }
};

fixDatabase();
