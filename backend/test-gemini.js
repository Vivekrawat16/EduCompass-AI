const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const genAI = new GoogleGenerativeAI("AIzaSyB_aeUZ0Q_MoC1aBTHZRiBvI_9pvrMCNqg");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("Testing Gemini API...");
        const result = await model.generateContent("Say hello in one word");
        console.log("SUCCESS:", result.response.text());
    } catch (error) {
        console.log("ERROR:", error.message);
    }
}

test();
