const { GoogleGenerativeAI } = require("@google/generative-ai");

// Custom error class for Gemini service errors
class GeminiServiceError extends Error {
    constructor(message, code = 'PROCESSING_ERROR', details = null) {
        super(message);
        this.name = 'GeminiServiceError';
        this.code = code;
        this.details = details;
    }
}

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-2.5-flash - confirmed available via ListModels
const MODEL_NAME = "gemini-2.5-flash";

console.log(`[GeminiService] Initialized with model: ${MODEL_NAME}`);

/**
 * Generate AI response using official Google SDK
 * @param {string} prompt - The system/user prompt
 * @param {object} context - Contextual data (profile, universities, etc.)
 * @returns {Promise<object>} - Parsed JSON response
 */
const generateAIResponse = async (prompt, context) => {
    try {
        // Check API key
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_')) {
            throw new Error("GEMINI_API_KEY is not configured in .env");
        }

        // Get the model
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // Build the full prompt with context
        const fullPrompt = `${prompt}\n\nCONTEXT DATA:\n${JSON.stringify(context, null, 2)}`;

        console.log("[GeminiService] Sending request to Gemini...");

        // Generate content
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const textResponse = response.text();

        console.log("[GeminiService] Raw response received:", textResponse.substring(0, 200) + "...");

        // Parse JSON from response
        try {
            // Find JSON object using regex (handles text before/after)
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.warn("[GeminiService] No JSON found, returning raw text as message");
                return {
                    thought: "Response was not in JSON format",
                    message: textResponse,
                    actions: []
                };
            }

            const parsed = JSON.parse(jsonMatch[0]);
            return parsed;

        } catch (parseError) {
            console.error("[GeminiService] JSON Parse Error:", parseError.message);
            // Fallback: return raw text as message
            return {
                thought: "Failed to parse JSON",
                message: textResponse,
                actions: []
            };
        }

    } catch (error) {
        console.error("[GeminiService] Error:", error.message);

        // Return a user-friendly error response
        return {
            thought: `Error: ${error.message}`,
            message: "I'm having trouble connecting right now. Please try again in a moment.",
            actions: []
        };
    }
};

module.exports = {
    generateAIResponse,
    GeminiServiceError
};
