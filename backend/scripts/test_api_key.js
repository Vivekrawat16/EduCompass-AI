// Simple test to check API key validity
require('dotenv').config();
const axios = require('axios');

async function testAPIKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');

    // Try listing models to verify API key
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );
        console.log('\n✅ API Key is valid!');
        console.log('\nAvailable models:');
        response.data.models.slice(0, 5).forEach(model => {
            console.log(`  - ${model.name}`);
        });
    } catch (error) {
        console.log('\n❌ API Key test failed:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data?.error?.message || error.message);
    }
}

testAPIKey();
