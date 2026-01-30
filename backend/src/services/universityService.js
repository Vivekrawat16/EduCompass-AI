const pool = require('../../config/db');

/**
 * University Service
 * 
 * NOTE: External university APIs (Hipo Labs) were removed due to network restrictions.
 * Universities are now managed via PostgreSQL database only.
 * Use database seed scripts to populate university data.
 */

/**
 * Get all universities from database
 * @param {Object} filters - Filter options (country, max_tuition, max_ranking, search)
 * @returns {Promise<Array>} - Array of universities
 */
const getUniversitiesFromDB = async (filters = {}) => {
    try {
        const { country, max_tuition, max_ranking, search } = filters;

        let query = "SELECT * FROM universities WHERE 1=1";
        const params = [];
        let paramCount = 1;

        if (country) {
            query += ` AND country = $${paramCount}`;
            params.push(country);
            paramCount++;
        }

        if (max_tuition) {
            query += ` AND tuition_fee <= $${paramCount}`;
            params.push(max_tuition);
            paramCount++;
        }

        if (max_ranking) {
            query += ` AND ranking <= $${paramCount}`;
            params.push(max_ranking);
            paramCount++;
        }

        if (search) {
            query += ` AND name ILIKE $${paramCount}`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += " ORDER BY ranking ASC";

        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Database error:', error.message);
        throw error;
    }
};

/**
 * Get university by ID
 * @param {number} id - University ID
 * @returns {Promise<Object>} - University object
 */
const getUniversityById = async (id) => {
    try {
        const result = await pool.query(
            "SELECT * FROM universities WHERE id = $1",
            [id]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Database error:', error.message);
        throw error;
    }
};

/**
 * Get universities by country
 * @param {string} country - Country name
 * @returns {Promise<Array>} - Array of universities
 */
const getUniversitiesByCountry = async (country) => {
    try {
        const result = await pool.query(
            "SELECT * FROM universities WHERE country = $1 ORDER BY ranking ASC",
            [country]
        );
        return result.rows;
    } catch (error) {
        console.error('Database error:', error.message);
        throw error;
    }
};

/**
 * Get count of universities by country
 * @returns {Promise<Array>} - Array of {country, count}
 */
const getUniversityCountByCountry = async () => {
    try {
        const result = await pool.query(
            "SELECT country, COUNT(*) as count FROM universities GROUP BY country ORDER BY count DESC"
        );
        return result.rows;
    } catch (error) {
        console.error('Database error:', error.message);
        throw error;
    }
};

module.exports = {
    getUniversitiesFromDB,
    getUniversityById,
    getUniversitiesByCountry,
    getUniversityCountByCountry
};
