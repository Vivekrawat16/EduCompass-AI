// Find working models
require('dotenv').config();
const axios = require('axios');

async function findWorkingModel() {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // Get list of models
        const listResponse = await axios.get(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );

        console.log('Testing models that support generateContent:\n');

        for (const model of listResponse.data.models) {
            if (model.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`Testing: ${model.name}`);

                // Try to use this model
                const url = `https://generativelanguage.googleapis.com/v1/${model.name}:generateContent?key=${apiKey}`;
                const requestBody = {
                    contents: [{
                        parts: [{ text: "Say hello in JSON format: {\"message\": \"hello\"}" }]
                    }]
                };

                try {
                    const response = await axios.post(url, requestBody, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    console.log(`  ✅ SUCCESS! This model works.`);
                    console.log(`  Response: ${response.data.candidates[0].content.parts[0].text.substring(0, 100)}...\n`);
                    console.log(`\n🎉 Use this model: ${model.name}\n`);
                    break;
                } catch (error) {
                    console.log(`  ❌ Failed: ${error.response?.data?.error?.message || error.message}\n`);
                }
            }
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
}

findWorkingModel();
