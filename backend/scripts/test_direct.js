// Direct test with full error output
require('dotenv').config();
const axios = require('axios');

async function testDirect() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = 'models/gemini-2.5-flash-lite-001';
    const url = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;

    console.log('Testing URL:', url.replace(apiKey, 'API_KEY'));
    console.log('');

    const requestBody = {
        contents: [{
            parts: [{ text: "Say hello" }]
        }]
    };

    try {
        const response = await axios.post(url, requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ Success!');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ Error:');
        console.log('Status:', error.response?.status);
        console.log('Full error:', JSON.stringify(error.response?.data, null, 2));
    }
}

testDirect();
