// Get detailed model info
require('dotenv').config();
const axios = require('axios');

async function getModelDetails() {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );
        console.log('Full model list with details:\n');
        response.data.models.forEach(model => {
            if (model.name.includes('gemini') && model.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`Name: ${model.name}`);
                console.log(`  Display Name: ${model.displayName}`);
                console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
                console.log('');
            }
        });
    } catch (error) {
        console.log('Error:', error.response?.data?.error?.message || error.message);
    }
}

getModelDetails();
