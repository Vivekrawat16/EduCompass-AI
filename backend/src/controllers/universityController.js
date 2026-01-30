const pool = require('../../config/db');
const hippoService = require('../services/hippo.service');

/**
 * AI Categorization Logic
 * Determines if a university is Dream, Target, or Safe based on user profile
 */
const categorizeUniversity = (university, userProfile) => {
    // Placeholder AI Logic for HipoLabs data
    // In future, this will use real GPA/SAT stats mapped to university-specific data
    return {
        category: 'Target',
        score: Math.random().toFixed(2), // 0.00 - 1.00
        acceptanceChance: 'Medium'
    };
};

exports.getAllUniversities = async (req, res) => {
    try {
        const { country, limit, search, max_tuition, max_ranking } = req.query;

        // LOGIC: Use Hippo API if user enters a search term or filters by country
        // Otherwise (default state), show seeded data from our Database

        const shouldUseHippo = (search && search.trim().length > 0) || (country && country.trim().length > 0);

        if (shouldUseHippo) {
            console.log(`[UniversityController] Mode: Hippo API Search (Search: ${search}, Country: ${country})`);

            let universities = await hippoService.fetchUniversities({
                country: country,
                name: search
            });

            // Normalization & AI Enrichment (CRITICAL for Frontend)
            // Hippo only gives name, country, website. We must mock the rest to prevent crashes.
            let normalizedData = universities.map((u, index) => {
                // Generate consistent pseudo-random numbers based on name string hash
                let seed = 0;
                for (let i = 0; i < u.name.length; i++) {
                    seed = ((seed << 5) - seed) + u.name.charCodeAt(i);
                    seed |= 0; // Convert to 32bit integer
                }
                seed = Math.abs(seed);

                const mockRanking = (seed % 500) + 1; // 1-500
                const mockTuition = ((seed % 50) * 1000) + 10000; // 10k - 60k
                const mockAcceptance = (seed % 90) + 5; // 5-95%

                return {
                    id: `hippo-${index}-${seed}`, // Unique ID for frontend keys
                    name: u.name,
                    country: u.country,
                    city: "Campus City", // Placeholder
                    web_pages: u.web_pages || [],
                    website: u.web_pages ? u.web_pages[0] : null,
                    domain: u.domains ? u.domains[0] : null,

                    // Enriched Fields (Required by Frontend)
                    ranking: mockRanking,
                    tuition_fee: mockTuition,
                    acceptance_rate: mockAcceptance,
                    acceptance_chance: mockAcceptance > 50 ? 'High' : (mockAcceptance > 20 ? 'Medium' : 'Low'),
                    ai_category: mockRanking < 50 ? 'Dream' : (mockRanking < 200 ? 'Target' : 'Safe'),
                    match_reason: "Found via Global Search",
                    logo: null // Frontend handles null logo
                };
            });

            // Apply Client-Side Filters (since Hippo API only does name/country)
            if (max_tuition) {
                normalizedData = normalizedData.filter(u => u.tuition_fee <= parseInt(max_tuition));
            }
            if (max_ranking) {
                normalizedData = normalizedData.filter(u => u.ranking <= parseInt(max_ranking));
            }

            // Apply Limit
            const resultData = limit ? normalizedData.slice(0, parseInt(limit)) : normalizedData.slice(0, 50); // Cap at 50 for performance

            // Return ARRAY directly to match frontend expectation
            return res.json(resultData);
        }

        // DEFAULT STATE: Database Data
        console.log("[UniversityController] Mode: Seeded Database Data");

        let query = "SELECT * FROM universities";
        const params = [];
        const conditions = [];

        // Note: Even in DB mode, we can apply filters if we want, but the requirement specifically checks for user input triggers.
        // If we want the DB data to ALSO be filterable, we can add WHERE clauses here.
        // Current logic: If NO search/country inputs, show ALL DB data (or filtered by range).

        // Let's allow range filtering on DB data too
        if (max_tuition) {
            conditions.push(`tuition_fee <= $${params.length + 1}`);
            params.push(max_tuition);
        }
        if (max_ranking) {
            conditions.push(`ranking <= $${params.length + 1}`);
            params.push(max_ranking);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY ranking ASC";

        if (limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(limit);
        }

        const result = await pool.query(query, params);

        return res.json(result.rows); // Returns Array

    } catch (err) {
        console.error("University Controller Error:", err.message);
        res.status(500).json({ error: "Failed to fetch universities" });
    }
};

exports.getShortlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT s.id, s.category, u.* 
             FROM shortlists s 
             JOIN universities u ON s.university_id = u.id 
             WHERE s.user_id = $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.shortlistUniversity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { universityId, category } = req.body;

        // Check if already shortlisted
        const check = await pool.query(
            "SELECT * FROM shortlists WHERE user_id = $1 AND university_id = $2",
            [userId, universityId]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({ error: "University already shortlisted" });
        }

        const result = await pool.query(
            "INSERT INTO shortlists (user_id, university_id, category) VALUES ($1, $2, $3) RETURNING *",
            [userId, universityId, category || 'Target']
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.removeFromShortlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await pool.query("DELETE FROM shortlists WHERE id = $1 AND user_id = $2", [id, userId]);
        res.json("Removed from shortlist");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.importUniversities = async (req, res) => {
    res.status(501).json({ error: "Import functionality deprecated. Use /api/universities?country=Name" });
};

/**
 * AI-Powered University Recommendations
 * Returns universities grouped by Dream/Target/Safe based on user profile
 */
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get User Profile
        const profileRes = await pool.query(
            "SELECT * FROM profiles WHERE user_id = $1",
            [userId]
        );
        const profile = profileRes.rows[0];

        if (!profile) {
            return res.status(400).json({ error: "Please complete your profile first" });
        }

        // 2. Get all universities from DB
        const uniRes = await pool.query(
            "SELECT * FROM universities ORDER BY ranking ASC LIMIT 50"
        );
        const universities = uniRes.rows;

        // 3. AI Categorization Logic
        const categorizeUniversity = (uni) => {
            const userGPA = parseFloat(profile.gpa) || 0;
            const userBudget = profile.budget || '$20k - $40k';

            // Parse budget range
            const budgetMatch = userBudget.match(/\$(\d+)k/);
            const maxBudget = budgetMatch ? parseInt(budgetMatch[1]) * 1000 : 30000;

            // Calculate match score
            let matchScore = 50;
            let category = 'Target';
            let acceptanceChance = 'Medium';
            let costLevel = 'Medium';
            let matchReasons = [];
            let risks = [];

            // GPA-based categorization
            if (userGPA >= 3.8) {
                if (uni.ranking <= 50) {
                    category = 'Dream';
                    acceptanceChance = 'Medium';
                    matchScore = 70;
                } else if (uni.ranking <= 150) {
                    category = 'Target';
                    acceptanceChance = 'High';
                    matchScore = 85;
                } else {
                    category = 'Safe';
                    acceptanceChance = 'High';
                    matchScore = 95;
                }
            } else if (userGPA >= 3.3) {
                if (uni.ranking <= 30) {
                    category = 'Dream';
                    acceptanceChance = 'Low';
                    matchScore = 40;
                } else if (uni.ranking <= 100) {
                    category = 'Target';
                    acceptanceChance = 'Medium';
                    matchScore = 65;
                } else {
                    category = 'Safe';
                    acceptanceChance = 'High';
                    matchScore = 85;
                }
            } else {
                if (uni.ranking <= 100) {
                    category = 'Dream';
                    acceptanceChance = 'Low';
                    matchScore = 25;
                } else if (uni.ranking <= 300) {
                    category = 'Target';
                    acceptanceChance = 'Medium';
                    matchScore = 55;
                } else {
                    category = 'Safe';
                    acceptanceChance = 'High';
                    matchScore = 80;
                }
            }

            // Cost analysis
            const tuition = uni.tuition_fee || 30000;
            if (tuition > maxBudget * 1.5) {
                costLevel = 'High';
                risks.push('Above your budget range');
            } else if (tuition > maxBudget) {
                costLevel = 'Medium';
            } else {
                costLevel = 'Low';
                matchReasons.push('Within budget');
            }

            // Country match
            if (profile.target_country && uni.country?.toLowerCase().includes(profile.target_country.toLowerCase())) {
                matchReasons.push(`Matches your target: ${profile.target_country}`);
                matchScore += 10;
            }

            // Major match (simplified)
            if (profile.target_major) {
                matchReasons.push(`Programs in ${profile.target_major}`);
            }

            // Add ranking-based reasons
            if (uni.ranking <= 50) {
                matchReasons.push('Top 50 globally ranked');
                risks.push('Highly competitive admissions');
            } else if (uni.ranking <= 150) {
                matchReasons.push('Well-ranked institution');
            }

            // Add acceptance rate risk
            if (uni.acceptance_rate && uni.acceptance_rate < 20) {
                risks.push(`Low acceptance rate (${uni.acceptance_rate}%)`);
            }

            return {
                ...uni,
                category,
                matchScore: Math.min(matchScore, 100),
                acceptanceChance,
                costLevel,
                matchReasons: matchReasons.slice(0, 3),
                risks: risks.slice(0, 2)
            };
        };

        // 4. Categorize all universities
        const categorized = universities.map(categorizeUniversity);

        // 5. Group by category
        const dream = categorized.filter(u => u.category === 'Dream').slice(0, 5);
        const target = categorized.filter(u => u.category === 'Target').slice(0, 8);
        const safe = categorized.filter(u => u.category === 'Safe').slice(0, 5);

        res.json({
            profile: {
                gpa: profile.gpa,
                targetCountry: profile.target_country,
                targetMajor: profile.target_major,
                budget: profile.budget
            },
            recommendations: {
                dream,
                target,
                safe
            },
            totalCount: dream.length + target.length + safe.length
        });

    } catch (err) {
        console.error("[Recommendations] Error:", err.message);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
};
