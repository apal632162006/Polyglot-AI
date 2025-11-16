import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// Serve CSS and JS files
app.use(express.static(__dirname));

// *** FORCE HOMEPAGE TO LOAD INDEX.HTML ***
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("Error sending file:", err);
            res.status(500).send("Could not find index.html in: " + __dirname);
        }
    });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-03-25" });

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log("User asked:", userMessage);

        if (!model) throw new Error("Gemini model not initialized.");

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();

        console.log("AI replied:", text);
        res.json({ reply: text });

    } catch (error) {
        console.error("Error Details:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Looking for index.html in: ${__dirname}`);
});