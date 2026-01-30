// List all available Gemini models
require('dotenv').config();
const axios = require('axios');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );
        console.log('Available Gemini Models:\n');
        response.data.models.forEach(model => {
            if (model.name.includes('gemini')) {
                console.log(`${model.name}`);
            }
        });
    } catch (error) {
        console.log('Error:', error.response?.data?.error?.message || error.message);
    }
}

listModels();
