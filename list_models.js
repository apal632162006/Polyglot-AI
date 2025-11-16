import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Querying Google for available models...");

fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("\n❌ API ERROR:", data.error.message);
        } else if (data.models) {
            console.log("\n✅ SUCCEESS! Here are the models you can use:");
            console.log("---------------------------------------------");
            data.models.forEach(m => {
                // Only show models that support content generation
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`Model Name: ${m.name.replace('models/', '')}`);
                }
            });
            console.log("---------------------------------------------");
            console.log("Pick one of the names above and put it in your server.js!");
        } else {
            console.log("No models found. Check your API Key permissions.");
        }
    })
    .catch(err => console.error("Network Error:", err));