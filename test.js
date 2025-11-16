import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("Checking available models for your API Key...");

        // Get the model info directly
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success! 'gemini-pro' works.");

    } catch (error) {
        console.log("\nERROR DETAILS:");
        console.log(error.message);

        if (error.message.includes("API_KEY")) {
            console.log("\n>>> CHECK YOUR .ENV FILE. YOUR KEY IS LIKELY INVALID OR MISSING.");
        }
    }
}

listModels();