const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const seedUniversities = async () => {
    try {
        const seedPath = path.join(__dirname, '../../database/seeds_universities.sql');
        const sql = fs.readFileSync(seedPath, 'utf8');

        console.log('Seeding Universities...');
        await pool.query(sql);
        console.log('Universities seeded successfully.');
        process.exit(0);
    } catch (err) {
        if (err.code === '23505') { // Unique violation, ignore if re-running
            console.log('Universities data likely already exists (duplicate key).');
            process.exit(0);
        }
        console.error('Error seeding universities:', err);
        process.exit(1);
    }
};

seedUniversities();
