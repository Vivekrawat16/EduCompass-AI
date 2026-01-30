// Test script to verify Gemini API connection
require('dotenv').config();
const { generateAIResponse, GeminiServiceError } = require('../src/services/geminiService');

async function testGeminiConnection() {
    console.log('='.repeat(50));
    console.log('Testing Gemini API Connection');
    console.log('='.repeat(50));

    // Check if API key is set
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`\nAPI Key Status: ${apiKey ? (apiKey.includes('your_gemini_api_key') ? '❌ Placeholder detected' : '✅ Set') : '❌ Not set'}`);

    if (!apiKey || apiKey.includes('your_gemini_api_key')) {
        console.log('\n⚠️  Please update GEMINI_API_KEY in your .env file');
        console.log('Get your API key from: https://makersuite.google.com/app/apikey\n');
        process.exit(1);
    }

    // Test API call
    console.log('\nTesting AI response generation...\n');

    const testPrompt = `You are a test AI. Respond with this exact JSON structure:
{
  "analysis": "Test analysis",
  "recommendations": {
    "dream": ["Test University 1"],
    "target": ["Test University 2"],
    "safe": ["Test University 3"]
  },
  "actions": [],
  "message": "Test message from AI"
}`;

    const testContext = {
        user_profile: {
            name: "Test User",
            gpa: "3.5",
            country: "USA"
        }
    };

    try {
        const response = await generateAIResponse(testPrompt, testContext);
        console.log('✅ Success! Gemini API is working correctly.\n');
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('\n✅ All systems operational!');
    } catch (error) {
        if (error instanceof GeminiServiceError) {
            console.log(`\n❌ Gemini Service Error [${error.code}]:`);
            console.log(`   ${error.message}\n`);
        } else {
            console.log('\n❌ Unexpected Error:');
            console.log(`   ${error.message}\n`);
        }
        process.exit(1);
    }
}

testGeminiConnection();
