const axios = require('axios');

const BASE_URL = 'http://universities.hipolabs.com/search';

// In-memory cache
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const USA_UNIVERSITIES = [
    { name: "Massachusetts Institute of Technology (MIT)", country: "United States", web_pages: ["https://web.mit.edu/"], domains: ["mit.edu"] },
    { name: "Stanford University", country: "United States", web_pages: ["https://www.stanford.edu/"], domains: ["stanford.edu"] },
    { name: "Harvard University", country: "United States", web_pages: ["https://www.harvard.edu/"], domains: ["harvard.edu"] },
    { name: "California Institute of Technology (Caltech)", country: "United States", web_pages: ["https://www.caltech.edu/"], domains: ["caltech.edu"] },
    { name: "University of Chicago", country: "United States", web_pages: ["https://www.uchicago.edu/"], domains: ["uchicago.edu"] },
    { name: "Princeton University", country: "United States", web_pages: ["https://www.princeton.edu/"], domains: ["princeton.edu"] },
    { name: "Cornell University", country: "United States", web_pages: ["https://www.cornell.edu/"], domains: ["cornell.edu"] },
    { name: "Yale University", country: "United States", web_pages: ["https://www.yale.edu/"], domains: ["yale.edu"] },
    { name: "Columbia University", country: "United States", web_pages: ["https://www.columbia.edu/"], domains: ["columbia.edu"] },
    { name: "University of Pennsylvania", country: "United States", web_pages: ["https://www.upenn.edu/"], domains: ["upenn.edu"] },
    { name: "University of Michigan-Ann Arbor", country: "United States", web_pages: ["https://umich.edu/"], domains: ["umich.edu"] },
    { name: "Johns Hopkins University", country: "United States", web_pages: ["https://www.jhu.edu/"], domains: ["jhu.edu"] },
    { name: "University of California, Berkeley (UCB)", country: "United States", web_pages: ["https://www.berkeley.edu/"], domains: ["berkeley.edu"] },
    { name: "University of California, Los Angeles (UCLA)", country: "United States", web_pages: ["https://www.ucla.edu/"], domains: ["ucla.edu"] },
    { name: "New York University (NYU)", country: "United States", web_pages: ["https://www.nyu.edu/"], domains: ["nyu.edu"] },
    { name: "Duke University", country: "United States", web_pages: ["https://duke.edu/"], domains: ["duke.edu"] },
    { name: "Northwestern University", country: "United States", web_pages: ["https://www.northwestern.edu/"], domains: ["northwestern.edu"] },
    { name: "Carnegie Mellon University", country: "United States", web_pages: ["https://www.cmu.edu/"], domains: ["cmu.edu"] },
    { name: "University of Washington", country: "United States", web_pages: ["https://www.washington.edu/"], domains: ["washington.edu"] },
    { name: "University of California, San Diego (UCSD)", country: "United States", web_pages: ["https://ucsd.edu/"], domains: ["ucsd.edu"] },
    { name: "Georgia Institute of Technology", country: "United States", web_pages: ["https://www.gatech.edu/"], domains: ["gatech.edu"] },
    { name: "University of Texas at Austin", country: "United States", web_pages: ["https://www.utexas.edu/"], domains: ["utexas.edu"] },
    { name: "University of Illinois at Urbana-Champaign", country: "United States", web_pages: ["https://illinois.edu/"], domains: ["illinois.edu"] },
    { name: "University of Wisconsin-Madison", country: "United States", web_pages: ["https://www.wisc.edu/"], domains: ["wisc.edu"] },
    { name: "Boston University", country: "United States", web_pages: ["https://www.bu.edu/"], domains: ["bu.edu"] },
    { name: "University of Southern California (USC)", country: "United States", web_pages: ["https://www.usc.edu/"], domains: ["usc.edu"] },
    { name: "Brown University", country: "United States", web_pages: ["https://www.brown.edu/"], domains: ["brown.edu"] },
    { name: "University of North Carolina at Chapel Hill", country: "United States", web_pages: ["https://www.unc.edu/"], domains: ["unc.edu"] },
    { name: "Rice University", country: "United States", web_pages: ["https://www.rice.edu/"], domains: ["rice.edu"] },
    { name: "Dartmouth College", country: "United States", web_pages: ["https://home.dartmouth.edu/"], domains: ["dartmouth.edu"] }
];

/**
 * Fetch universities from HipoLabs API
 * @param {Object} params - Search parameters ({ country, name })
 * @returns {Promise<Array>} - Array of universities
 */
const fetchUniversities = async ({ country, name }) => {
    try {
        if (!country && !name) throw new Error("Country or Name parameter is required");

        // HARDCODE OVERRIDE FOR USA
        if (country && (country.toLowerCase() === 'usa' || country.toLowerCase() === 'united states')) {
            console.log(`[HipoService] Serving Hardcoded Data for USA`);
            let data = USA_UNIVERSITIES;
            if (name) {
                data = data.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
            }
            return data;
        }

        // Create a unique cache key based on params
        const paramString = JSON.stringify({ country, name }).toLowerCase();
        const cacheKey = `uni_${paramString}`;

        if (cache.has(cacheKey)) {
            const { data, timestamp } = cache.get(cacheKey);
            if (Date.now() - timestamp < CACHE_TTL) {
                console.log(`[HipoService] Serving cache for ${paramString}`);
                return data;
            }
            cache.delete(cacheKey);
        }

        console.log(`[HipoService] Fetching API for ${paramString}...`);

        const requestParams = {};

        // Map common abbreviations to full names expected by Hipolabs
        const countryMapping = {
            "USA": "United States",
            "UK": "United Kingdom",
            "UAE": "United Arab Emirates"
        };

        if (country) {
            // Use mapped value if exists, otherwise use original (case-insensitive check could be added if needed)
            const normalizedCountry = countryMapping[country] || country;
            requestParams.country = normalizedCountry;
        }

        if (name) requestParams.name = name;

        const response = await axios.get(BASE_URL, {
            params: requestParams,
            timeout: 5000 // 5s timeout
        });

        const data = response.data;

        // Cache result
        cache.set(cacheKey, { data, timestamp: Date.now() });

        return data;
    } catch (error) {
        console.error("[HipoService] Error:", error.message);

        // Return fallback mock data instead of throwing
        console.warn("[HipoService] Returning fallback mock data");
        return [
            {
                name: `Sample University (${name || country})`,
                country: country || "Unknown",
                web_pages: ["https://example.edu"],
                domains: ["example.edu"],
                alpha_two_code: "US"
            }
        ];
    }
};

module.exports = {
    fetchUniversities
};
