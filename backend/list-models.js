const https = require('https');

const API_KEY = "AIzaSyB_aeUZ0Q_MoC1aBTHZRiBvI_9pvrMCNqg";

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.models) {
            console.log("Available models:");
            parsed.models.forEach(m => {
                console.log(`  - ${m.name} (${m.displayName})`);
            });
        } else {
            console.log("Response:", data);
        }
    });
}).on('error', e => console.log("Error:", e.message));
